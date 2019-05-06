
import { success, notFound } from '../../services/response/'
import { makeObject } from '../../services/dataCollection/'
import aqp from 'api-query-params'

// Lógica de selección de $skip y $limit para paginados
function get_pagination_datas(query) {
  const max_page_size = 100

  if (query.filter.pageSize) {
    query.limit = query.filter.pageSize
    delete query.filter.pageSize
  } else {
    query.limit = max_page_size
  }
  if (query.filter.page) {
    var aux = parseInt(query.filter.page)

    if (aux > 0) --aux
    else aux = 1

    query.skip = aux * query.limit
    delete query.filter.page
  }
  return query
}

export const queries = (req, res, next) => {
  const DataObject = makeObject(req.params.dataCollection)
  const query = get_pagination_datas(aqp(req.query))

  DataObject.count(query.filter)
    .then(total =>
      DataObject
      .find(query.filter)
      .skip(query.skip)
      .limit(query.limit)
      .sort(query.sort)
      .select(query.projection)
      .then((DataObjects) => ({
        pagination:{
          pageSize: query.limit,
          page: parseInt((query.skip || 0) / query.limit) + 1,
          total
        },
        results: DataObjects.map((DataObject) => DataObject)
      }))
    )
    .then(success(res))
    .catch(next)
}

// Maneja la creación o actualización de de un documento
// (si no existe, lo crea)
export const create = (req, res, next) => {
  const DataObject = makeObject(req.params.dataCollection)
  const filter = aqp(req.query).filter
  const update = req.body

  DataObject.create(update, (err) => {
    if (err) return res.status(500).send({error: err})
    else return res.status(200).json({
      response: "ok",
      message: "Succesfully saved"
    })
  })
}

export const update = (req, res, next) => {
  const DataObject = makeObject(req.params.dataCollection)
  const filter = aqp(req.query).filter
  const update = req.body

  DataObject.findOneAndUpdate(filter, update, { upsert: true }, (err) => {
    if (err) return res.status(500).send({error: err})
    else return res.status(200).json({
      response: "ok",
      message: "Succesfully saved"
    })
  })
}

// Crea un join() entre dataset y publisher
export const joins = (req, res, next) => {
  const DataObject = makeObject(req.params.firstCollection)
  const query = get_pagination_datas(aqp(req.query))
  const _as = query.filter.as || 'publisher'
  let totalDataset = 0
  let pags = 0
  const lookUp = {
    from: req.params.secondCollection,
    localField: query.filter.local || 'publisher',
    foreignField: query.filter.foreign || 'publisher',
    as: _as
  }
  
  // Crea un buscador de texto y
  // elimina el atributo 'text'
  if (query.filter.text) {
    query.filter.$text = { $search: query.filter.text }
    delete query.filter.text
  }

  if (!query.sort) {
    query.sort = {modified: -1}
  }

  // Se aplica una promesa múltiple para devolver en primer instancia
  // el total de resultados de acuerdo a sus filtrados 
  // y posteriormente se obtiene el objeto resultante aplicandole: $skip y $limit
  Promise.all([
    DataObject.aggregate()
      .match(query.filter)
      .lookup(lookUp)
      .unwind(_as)
      .exec((err, result) => {
        if (err) return handleError(err)
        totalDataset = result.length
      }),
    DataObject.aggregate()
      .match(query.filter)
      .lookup(lookUp)
      .unwind(_as)
      .skip(query.skip || 0)
      .limit(query.limit)
      .sort(query.sort)
      .exec((err, result) => {
        if (err) return handleError(err)
        pags = result
      })
  ]).then(values => {
    res.status(200).json({
      pagination: {
        pageSize: query.limit,
        page: parseInt((query.skip || 0) / query.limit) + 1,
        total: totalDataset
      },
      results: pags.map((DataObject) => DataObject)
    })
  }, reazon => {
      handleError(reazon)
  })
}

// Obtiene un filtrado de dataset de acuerdo a su identificador
// además de ello, hace un join con el objeto publishers
export const uniques = (req, res, next) => {
  const DataObject = makeObject(req.params.dataCollection)

  DataObject.aggregate()
    .match({ identifier: req.params.identifier })
    .lookup({
      from: 'publishers',
      localField: 'publisher',
      foreignField: 'publisher',
      as: "publisher"
    })
    .unwind('$publisher')
    .exec((err, results) => {
      if (err) return handleError(err);

      res.status(200).json({
        response: 'ok',
        results
      })
    })
}

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  res.status(200).json([])
