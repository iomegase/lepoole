import ReactMarkdown from 'react-markdown'

export function MarkdownContent({ content }: { content: string }) {
  return <div className="service-prose"><ReactMarkdown skipHtml>{content}</ReactMarkdown></div>
}
