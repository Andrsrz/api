import { validate_token } from '../../services/authentication'
import { makeObject } from '../../services/dataCollection'

module.exports = {
  authorization(req, res, next) {
    try {
      const payload = validate_token(req.headers.authorization)

      if (payload && req.query._id) {
        const DataObject = makeObject('dataset')

        DataObject.findOne({ _id: req.query._id })
          .then(data => {
            if (data._doc.publisher === payload.publisher) next()
            else res.status(500).json({
              response: 'error',
              message: 'El usuario pertenece a una institución distinta a la del dataset'
            })
          })
          .catch(error => {
            res.status(500).json({
              response: 'error',
              message: error.message
            })
          })
      } else if (payload) {
        next()
      } else {
        res.status(500).json({
          response: 'error',
          message: 'No tiene autorización para crear o modificar datasets'
        })
      }
    } catch (err) {
      res.status(500).json({
        response: 'error',
        message: `${err.name}: ${err.message}`
      })
    }
  }
}