
export function errorHandler(err, req, res, next) {
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
  }
  

  export function validate(schema) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ error: error.details.map(d => d.message).join(', ') });
      }
      req.body = value;
      next();
    };
  }
  