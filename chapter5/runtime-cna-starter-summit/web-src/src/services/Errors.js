class AppError extends Error {
  constructor (message, status) {
    if (typeof message === 'object') {
      super(JSON.stringify(message))
      this.json = message
    } else {
      super(message)
    }

    this.name = this.constructor.name
    this.stack = Error().stack // Error.captureStackTrace(this, this.constructor)

    this.status = status || 500
  }
}

class RequestValidationError extends AppError {
  constructor (fields) {
    super('Request validation failed, ' + JSON.stringify(fields), 400)
    this.fields = fields || {}
  }
}

module.exports = { AppError, RequestValidationError }
