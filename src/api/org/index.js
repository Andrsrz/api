import { Router } from 'express'
import { middleware as query } from 'querymen'
import { index, queries, create, update, joins, uniques } from './controller'
import { authorization } from './auth'
import { validate_body } from '../../services/validations'

const router = new Router()

router.get('/',
  query(),
  index)

/**
 * @api {get} /org/:id Retrieve org
 * @apiName RetrieveOrg
 * @apiGroup Org
 * @apiSuccess {Object} org Org's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Org not found.
 */
router.get('/:dataCollection',
  queries)

/**
* default query params --> 
* @local local=publisher
* @foreign foreign=publisher
* @as as=publisher
*/
// Crea una unión entre dos colecciones
router.get('/:firstCollection/join/:secondCollection', joins)

// Obtiene un filtrado de dataset de acuerdo a su identificador
// además de ello, hace un join con el objeto publishers
router.get('/:dataCollection/unique/:identifier', uniques)

// Guarda coleciones de datos
router.post('/:dataCollection', authorization, validate_body, create)

// Actualiza colecciones de datos
router.put('/:dataColeccion', authorization, validate_body, update)

export default router
