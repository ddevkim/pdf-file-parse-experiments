export function makeUrl(apiPath, queryObj) {
  // 정규 표현식을 사용하여 :query 형식의 문자열을 찾습니다.
  const pathWithReplacedQuery = process.env.API_URL + apiPath;

  // URLSearchParams를 사용하여 쿼리 객체를 쿼리스트링으로 변환합니다.
  const queryString = new URLSearchParams(queryObj).toString();

  // 쿼리스트링이 있는 경우에는 물음표와 함께 연결하여 전체 URL을 생성합니다.
  const url = queryString
    ? `${pathWithReplacedQuery}?${queryString}`
    : pathWithReplacedQuery;

  return url;
}
