import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx"
import { writeFileSync } from "fs"
import { readFileSync } from "fs"

// 读取Markdown报告内容
const markdownContent = readFileSync("/home/hzm/Documents/VLA_Papers/VLA_Papers_Summary_Report.md", "utf-8")

// 解析Markdown并转换为docx格式
function parseMarkdownToDocx(content: string) {
  const lines = content.split("\n")
  const children: any[] = []
  let currentSection: any[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 标题
    if (line.startsWith("# ")) {
      if (currentSection.length > 0) {
        children.push(...currentSection)
        currentSection = []
      }
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.substring(2),
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
        })
      )
    } else if (line.startsWith("## ")) {
      if (currentSection.length > 0) {
        children.push(...currentSection)
        currentSection = []
      }
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.substring(3),
              bold: true,
              size: 28,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      )
    } else if (line.startsWith("### ")) {
      if (currentSection.length > 0) {
        children.push(...currentSection)
        currentSection = []
      }
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.substring(4),
              bold: true,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      )
    } else if (line.startsWith("**") && line.endsWith("**")) {
      // 粗体文本
      const text = line.substring(2, line.length - 2)
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: text,
              bold: true,
              size: 22,
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      )
    } else if (line.startsWith("---")) {
      // 分隔线，跳过
      continue
    } else if (line.length > 0) {
      // 普通段落
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 22,
            }),
          ],
          spacing: { after: 100 },
        })
      )
    } else {
      // 空行
      children.push(
        new Paragraph({
          children: [],
          spacing: { after: 100 },
        })
      )
    }
  }
  
  if (currentSection.length > 0) {
    children.push(...currentSection)
  }
  
  return children
}

// 创建Word文档
const doc = new Document({
  sections: [
    {
      properties: {},
      children: parseMarkdownToDocx(markdownContent),
    },
  ],
})

// 生成Word文档
const buffer = await Packer.toBuffer(doc)
const outputPath = "/home/hzm/Documents/VLA_Papers_Summary_Report.docx"
writeFileSync(outputPath, buffer)

console.log(`Word文档已成功生成: ${outputPath}`)

