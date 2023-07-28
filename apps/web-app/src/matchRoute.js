function isNumeric(str) {
  if (typeof str != 'string') return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}
const matchRoute = (route, url) => {
  var routeMatcher = new RegExp(route.replace(/:[^\s/]+/g, '([\\w-]+)'));
  const matchValue = url.match(routeMatcher);
  if (!matchValue) {
    return {
      input: url,
      route,
      isMatched: false,
    };
  }

  return Object.entries(matchValue).reduce(
    (res, [key, value]) => {
      if (typeof key === 'string' && isNumeric(key) && !!+key) {
        res.params.push(value);
      }
      return res;
    },
    {
      input: url,
      route,
      params: [],
      isMatched: true,
    }
  );
};
