export function createError(category, linenumber, rawtext, message){
  return {category,linenumber,rawtext,message};
}