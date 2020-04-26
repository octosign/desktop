const parseAuthor = (author: string) => {
  // Regex from Jon Schlinkert (c) 2014 licensed under the MIT license
  const authorRegex = new RegExp(/^([^<(]+?)?[ \t]*(?:<([^>(]+?)>)?[ \t]*(?:\(([^)]+?)\)|$)/, 'gm');

  const match = authorRegex.exec(author);
  if (!match) return undefined;

  return {
    name: match[1],
    email: match[2],
    web: match[3],
  };
};

export default parseAuthor;
