export const validate = (schema) => (req, _res, next) => {
    schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
    });
    next();
};
//# sourceMappingURL=validate.js.map