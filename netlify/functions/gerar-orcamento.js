const PDFDocument = require("pdfkit");

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const {
      nome,
      telefone,
      cidade,
      servico,
      btu,
      tipoImovel,
      distanciaKm
    } = data;

    // === TABELA DE PREÇOS ===
    let valorBase = 0;

    if (servico === "ar-condicionado" && btu === "9000") {
      valorBase = 500;
    }

    // deslocamento: R$3 por km
    const deslocamento = distanciaKm * 3;

    const total = valorBase + deslocamento;

    // Criar PDF
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
    });

    doc.fontSize(20).text("VOLTARIS ENGENHARIA", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text("CNPJ: 50.999.357/0001-01");
    doc.text("São Leopoldo - RS");
    doc.moveDown();

    doc.text(`Cliente: ${nome}`);
    doc.text(`Telefone: ${telefone}`);
    doc.text(`Cidade: ${cidade}`);
    doc.moveDown();

    doc.text("Serviço:");
    doc.text(`Instalação Ar-Condicionado ${btu} BTUs`);
    doc.text(`Tipo de imóvel: ${tipoImovel}`);
    doc.moveDown();

    doc.text(`Valor base: R$ ${valorBase.toFixed(2)}`);
    doc.text(`Deslocamento (${distanciaKm} km): R$ ${deslocamento.toFixed(2)}`);
    doc.moveDown();

    doc.fontSize(16).text(`TOTAL ESTIMADO: R$ ${total.toFixed(2)}`);
    doc.moveDown();

    doc.fontSize(10).text("Valor sujeito à vistoria técnica.");

    doc.end();

    const pdfBuffer = await new Promise((resolve) => {
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=orcamento_voltaris.pdf"
      },
      body: pdfBuffer.toString("base64"),
      isBase64Encoded: true
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: "Erro ao gerar orçamento"
    };
  }
};