import { Router } from 'express'
import { middleware as query } from 'querymen'
import { index, queries, create, update, joins, uniques } from './controller'

const router = new Router()
const sso = require('saml-client-express')

var bodyParser = require('body-parser');
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
router.use('/sso/metadata', sso.metadata);
router.use('/login', sso.spinitsso)
router.use('/sso/acs', sso.acs)

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
router.post('/:dataCollection', create)

// Actualiza colecciones de datos
router.put('/:dataColeccion', update)

export default router
