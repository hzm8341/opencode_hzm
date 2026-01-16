import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx"
import { writeFileSync } from "fs"

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: "示例文档",
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.TITLE,
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "这是一个使用docx库创建的Word文档示例。该文档包含标题和段落内容，展示了基本的文档结构功能。",
            }),
          ],
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "docx库允许我们在Node.js环境中动态创建和修改Microsoft Word文档，支持丰富的格式选项。",
            }),
          ],
        }),
      ],
    },
  ],
})

const buffer = await Packer.toBuffer(doc)
writeFileSync("example.docx", buffer)

console.log("Word文档已创建: example.docx")
