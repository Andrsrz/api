
import { success, notFound } from '../../services/response/'
import { makeObject } from '../../services/dataCollection/'
import mongoose from 'mongoose'
import aqp from 'api-query-params'


export const queries = (req, res, next) => {
  const max_page_size = 100
  const DataObject = makeObject(req.params.dataCollection)
  const query = aqp(req.query)
  if (query.filter.pageSize) {
    query.limit = query.filter.pageSize
    delete query.filter.pageSize
  }else{
    query.limit = max_page_size
  }
  if (query.filter.page) {
    var aux = parseInt(query.filter.page)

    if(aux > 0){
      --aux
    }else{
      aux = 1
    }
    query.skip = aux * query.limit
    delete query.filter.page
  }
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

  //console.log(`params = ${DataObject}`)
  console.log("query =>")
  console.dir(filter)
  console.log("body =>")
  console.dir(update)

  DataObject.create(update, (err) => {
    if (err) return res.send(500, {error: err})
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

  //console.log(`params = ${DataObject}`)
  console.log("queryToUpdate =>")
  console.dir(filter)
  console.log("body =>")
  console.dir(update)

  DataObject.findOneAndUpdate(filt, update, { upsert: true }, (err) => {
    if (err) return res.send(500, {error: err})
    else return res.status(200).json({
      response: "ok",
      message: "Succesfully saved"
    })
  })
}

// Crea un join() entre dos colecciones
export const joins = (req, res, next) => {
  const DataObject = makeObject(req.params.firstCollection)
  const query = aqp(req.query).filter
  let _as = query.as || 'publisher'

  DataObject.aggregate()
    .lookup({
      from: req.params.secondCollection,
      localField: query.local || 'publisher',
      foreignField: query.foreign || 'publisher',
      as: _as
    })
    .unwind(_as)
    .exec((err, result) => {
      if (err) return handleError(err);
      res.status(200).json({
        response: "ok",
        results: result
      })
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
    .exec((err, result) => {
      if (err) return handleError(err);
      res.status(200).json({
        response: "ok",
        results: result
      })
    })
}

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  res.status(200).json([])
