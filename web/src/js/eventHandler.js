import axios from "axios";
import { makeUrl } from "./utils";
import { $attr } from "fxdom/es";
import * as svgson from "svgson";

export async function handlePdfFile({ currentTarget: ct }) {
  const pdfFile = ct.files[0];
  if (pdfFile) {
    try {
      const saveFile = $attr("save-file", ct) ?? false;

      axios
        .post(
          makeUrl(`/pdf/parse/`, { saveFile }),
          { pdfParser: ct.name, pdfFile },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        )
        .then((response) => {
          const resultDiv = document.getElementById("result");
          const contentType = response.headers["content-type"];
          if (contentType.includes("application/json")) {
            // JSON 응답인 경우
            const jsonData = response.data;
            resultDiv.innerHTML = `<pre>${JSON.stringify(jsonData, null, 2)}</pre>`;
          } else if (contentType.includes("image/svg+xml")) {
            // SVG 응답인 경우
            const svgData = response.data;

            resultDiv.innerHTML = `<pre>${JSON.stringify(
              svgData.map((svg_text) => {
                return svgson.parseSync(svg_text);
              }),
              null,
              2,
            )}</pre>`;
          } else {
            // 다른 유형의 응답에 대한 처리
            console.warn("Unsupported Content-Type:", contentType);
          }
        })
        .catch((error) => {
          console.error("Error uploading PDF:", error);
        });
    } catch (err) {
      console.error(err);
    }
  } else {
    alert("Please select a PDF file");
  }
}

export async function handleHello() {
  try {
    const res = (await axios.get(makeUrl("/hello"))).data;
    console.log("res", res);
  } catch (err) {
    console.error(err);
  }
}
