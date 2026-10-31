export function validate(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Assign parsed/coerced values back safely
      if (parsed.body) {
        try {
          req.body = parsed.body;
        } catch {
          Object.assign(req.body, parsed.body);
        }
      }
      if (parsed.query) {
        try {
          req.query = parsed.query;
        } catch {
          if (req.query && typeof req.query === 'object') {
            for (const key of Object.keys(req.query)) {
              delete req.query[key];
            }
            Object.assign(req.query, parsed.query);
          }
        }
      }
      if (parsed.params) {
        try {
          req.params = parsed.params;
        } catch {
          Object.assign(req.params, parsed.params);
        }
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
