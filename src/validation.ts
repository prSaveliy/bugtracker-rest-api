function validateBug(body: any) {
  if (
    !body ||
    typeof body.author !== 'string' ||
    body.author.length > 64 ||
    typeof body.title !== 'string' ||
    body.title.length > 128 ||
    typeof body.description !== 'string' ||
    body.description.length > 1000
  ) {
    return false;
  }
  return true;
}

function validateComment(commentData: any) {
  if (
    !commentData ||
    typeof commentData.author !== 'string' ||
    commentData.author.length > 64 ||
    typeof commentData.message !== 'string' ||
    commentData.message > 500
  ) {
    return false;
  }
  return true;
}

export { validateBug, validateComment };