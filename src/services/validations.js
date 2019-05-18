// Validation service
import Ajv from 'ajv'

module.exports = {
  validate_body(req, res, next) {
    const ajv = new Ajv({ allErrors: true, format: 'full' })
    ajv.addFormat('endWidth', /\.(json|csv)$/)
    const schema = {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1, maxLength: 115 },
        description: { type: 'string', minLength: 1 },
        downloadURL: { type: 'string', format: 'endWidth', minLength: 1 },
        accrualPeriodicity: { type: 'string', minLength: 1 },
        theme: { type: 'array', minItems: 1, items: { type: 'string' } },
        dataDictionary: { type: 'string', format: 'uri', minLength: 1 }
      }
    }

    if (!req.query._id) {
      schema.required = [
        'title', 'description', 'downloadURL', 'accrualPeriodicity', 'theme', 'dataDictionary'
      ]
    }

    let valid = ajv.validate(schema, req.body)

    if (!valid) {
      res.status(500).json({
        response: 'error',
        errors: ajv.errors
      })
    } else next()
  }
}