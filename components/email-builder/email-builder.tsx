"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Type, ImageIcon, Square, Minus, Plus, Trash2, MoveUp, MoveDown, Eye, Save } from "lucide-react"

interface EmailBlock {
  id: string
  type: "header" | "text" | "image" | "button" | "divider" | "spacer"
  content: {
    text?: string
    imageUrl?: string
    buttonText?: string
    buttonUrl?: string
    backgroundColor?: string
    textColor?: string
    fontSize?: string
    alignment?: "left" | "center" | "right"
    padding?: string
  }
}

interface EmailBuilderProps {
  initialBlocks?: EmailBlock[]
  onSave?: (blocks: EmailBlock[], html: string) => void
  onPreview?: (html: string) => void
}

export function EmailBuilder({ initialBlocks = [], onSave, onPreview }: EmailBuilderProps) {
  const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<"blocks" | "canvas" | "properties">("canvas")

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId)

  const addBlock = (type: EmailBlock["type"]) => {
    const newBlock: EmailBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: {
        text: type === "header" ? "Heading" : type === "text" ? "Your text here..." : "",
        buttonText: type === "button" ? "Click Here" : undefined,
        buttonUrl: type === "button" ? "#" : undefined,
        backgroundColor: type === "header" ? "#f3f4f6" : "#ffffff",
        textColor: "#000000",
        fontSize: type === "header" ? "32px" : "16px",
        alignment: "left",
        padding: "20px",
      },
    }
    setBlocks([...blocks, newBlock])
    setSelectedBlockId(newBlock.id)
  }

  const updateBlock = (id: string, content: Partial<EmailBlock["content"]>) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content: { ...b.content, ...content } } : b)))
  }

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id))
    if (selectedBlockId === id) setSelectedBlockId(null)
  }

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex((b) => b.id === id)
    if ((direction === "up" && index === 0) || (direction === "down" && index === blocks.length - 1)) return

    const newBlocks = [...blocks]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
    setBlocks(newBlocks)
  }

  const generateHTML = () => {
    const blocksHTML = blocks
      .map((block) => {
        const { content } = block
        const style = `background-color: ${content.backgroundColor}; color: ${content.textColor}; font-size: ${content.fontSize}; text-align: ${content.alignment}; padding: ${content.padding};`

        switch (block.type) {
          case "header":
            return `<div style="${style}"><h1 style="margin: 0; font-size: ${content.fontSize};">${content.text}</h1></div>`
          case "text":
            return `<div style="${style}"><p style="margin: 0; line-height: 1.6;">${content.text}</p></div>`
          case "image":
            return `<div style="${style}"><img src="${content.imageUrl}" alt="Email image" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" /></div>`
          case "button":
            return `<div style="${style}"><a href="${content.buttonUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">${content.buttonText}</a></div>`
          case "divider":
            return `<div style="${style}"><hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;" /></div>`
          case "spacer":
            return `<div style="height: ${content.padding};"></div>`
          default:
            return ""
        }
      })
      .join("")

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td>
              ${blocksHTML}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  }

  const handlePreview = () => {
    const html = generateHTML()
    if (onPreview) {
      onPreview(html)
    } else {
      const previewWindow = window.open("", "_blank")
      previewWindow?.document.write(html)
      previewWindow?.document.close()
    }
  }

  const handleSave = () => {
    const html = generateHTML()
    onSave?.(blocks, html)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="lg:hidden mb-4">
        <Tabs value={mobileTab} onValueChange={(v: any) => setMobileTab(v)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="blocks">Blocks</TabsTrigger>
            <TabsTrigger value="canvas">Canvas</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="hidden lg:grid lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Block Library */}
        <Card className="p-4 flex flex-col overflow-hidden">
          <h3 className="font-semibold mb-4">Add Blocks</h3>
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => addBlock("header")}
              >
                <Type className="mr-2 h-4 w-4" />
                Header
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => addBlock("text")}
              >
                <Type className="mr-2 h-4 w-4" />
                Text
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => addBlock("image")}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Image
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => addBlock("button")}
              >
                <Square className="mr-2 h-4 w-4" />
                Button
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => addBlock("divider")}
              >
                <Minus className="mr-2 h-4 w-4" />
                Divider
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => addBlock("spacer")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Spacer
              </Button>
            </div>
          </ScrollArea>
          <div className="pt-4 space-y-2 border-t mt-4">
            <Button className="w-full" onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button className="w-full bg-transparent" variant="outline" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </Card>

        {/* Canvas */}
        <Card className="p-4 flex flex-col overflow-hidden">
          <h3 className="font-semibold mb-4">Email Canvas</h3>
          <ScrollArea className="flex-1 border rounded-lg p-4 bg-gray-50">
            {blocks.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-sm">Add blocks to start building</p>
              </div>
            ) : (
              <div className="space-y-2">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className={`border rounded-lg p-3 bg-white cursor-pointer transition-all ${
                      selectedBlockId === block.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedBlockId(block.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase">{block.type}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveBlock(block.id, "up")
                          }}
                          disabled={index === 0}
                        >
                          <MoveUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveBlock(block.id, "down")
                          }}
                          disabled={index === blocks.length - 1}
                        >
                          <MoveDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteBlock(block.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: block.content.backgroundColor,
                        color: block.content.textColor,
                        padding: "8px",
                        textAlign: block.content.alignment,
                      }}
                    >
                      {block.type === "header" && <h3 className="font-bold">{block.content.text}</h3>}
                      {block.type === "text" && <p className="text-sm">{block.content.text}</p>}
                      {block.type === "image" && (
                        <div className="text-xs text-muted-foreground">{block.content.imageUrl || "No image URL"}</div>
                      )}
                      {block.type === "button" && (
                        <button className="px-4 py-2 bg-blue-500 text-white rounded text-sm">
                          {block.content.buttonText}
                        </button>
                      )}
                      {block.type === "divider" && <hr />}
                      {block.type === "spacer" && <div className="text-xs text-muted-foreground">Spacer</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Properties Panel */}
        <Card className="p-4 flex flex-col overflow-hidden">
          <h3 className="font-semibold mb-4">Properties</h3>
          <ScrollArea className="flex-1">
            {!selectedBlock ? (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-sm">Select a block to edit</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(selectedBlock.type === "header" || selectedBlock.type === "text") && (
                  <div className="space-y-2">
                    <Label>Text</Label>
                    <Textarea
                      value={selectedBlock.content.text}
                      onChange={(e) => updateBlock(selectedBlock.id, { text: e.target.value })}
                      rows={4}
                    />
                  </div>
                )}

                {selectedBlock.type === "image" && (
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      value={selectedBlock.content.imageUrl || ""}
                      onChange={(e) => updateBlock(selectedBlock.id, { imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}

                {selectedBlock.type === "button" && (
                  <>
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input
                        value={selectedBlock.content.buttonText}
                        onChange={(e) => updateBlock(selectedBlock.id, { buttonText: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button URL</Label>
                      <Input
                        value={selectedBlock.content.buttonUrl}
                        onChange={(e) => updateBlock(selectedBlock.id, { buttonUrl: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>
                  </>
                )}

                {selectedBlock.type !== "divider" && selectedBlock.type !== "spacer" && (
                  <>
                    <div className="space-y-2">
                      <Label>Alignment</Label>
                      <Select
                        value={selectedBlock.content.alignment}
                        onValueChange={(value: any) => updateBlock(selectedBlock.id, { alignment: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <Input
                        type="color"
                        value={selectedBlock.content.backgroundColor}
                        onChange={(e) => updateBlock(selectedBlock.id, { backgroundColor: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <Input
                        type="color"
                        value={selectedBlock.content.textColor}
                        onChange={(e) => updateBlock(selectedBlock.id, { textColor: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Padding</Label>
                  <Input
                    value={selectedBlock.content.padding}
                    onChange={(e) => updateBlock(selectedBlock.id, { padding: e.target.value })}
                    placeholder="20px"
                  />
                </div>
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>

      <div className="lg:hidden flex-1 min-h-0 flex flex-col">
        {mobileTab === "blocks" && (
          <Card className="p-4 flex flex-col flex-1 overflow-hidden">
            <h3 className="font-semibold mb-4">Add Blocks</h3>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  size="lg"
                  onClick={() => {
                    addBlock("header")
                    setMobileTab("canvas")
                  }}
                >
                  <Type className="mr-2 h-5 w-5" />
                  Header
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  size="lg"
                  onClick={() => {
                    addBlock("text")
                    setMobileTab("canvas")
                  }}
                >
                  <Type className="mr-2 h-5 w-5" />
                  Text
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  size="lg"
                  onClick={() => {
                    addBlock("image")
                    setMobileTab("canvas")
                  }}
                >
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Image
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  size="lg"
                  onClick={() => {
                    addBlock("button")
                    setMobileTab("canvas")
                  }}
                >
                  <Square className="mr-2 h-5 w-5" />
                  Button
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  size="lg"
                  onClick={() => {
                    addBlock("divider")
                    setMobileTab("canvas")
                  }}
                >
                  <Minus className="mr-2 h-5 w-5" />
                  Divider
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  size="lg"
                  onClick={() => {
                    addBlock("spacer")
                    setMobileTab("canvas")
                  }}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Spacer
                </Button>
              </div>
            </ScrollArea>
            <div className="pt-4 space-y-2 border-t mt-4">
              <Button className="w-full" size="lg" onClick={handlePreview}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button className="w-full bg-transparent" size="lg" variant="outline" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </Card>
        )}

        {mobileTab === "canvas" && (
          <Card className="p-4 flex flex-col flex-1 overflow-hidden">
            <h3 className="font-semibold mb-4">Email Canvas</h3>
            <ScrollArea className="flex-1 border rounded-lg p-4 bg-gray-50">
              {blocks.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <p>No blocks yet. Switch to Blocks tab to add content.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className={`border rounded-lg p-3 bg-white cursor-pointer transition-all ${
                        selectedBlockId === block.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => {
                        setSelectedBlockId(block.id)
                        setMobileTab("properties")
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase">{block.type}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveBlock(block.id, "up")
                            }}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveBlock(block.id, "down")
                            }}
                            disabled={index === blocks.length - 1}
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteBlock(block.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div
                        style={{
                          backgroundColor: block.content.backgroundColor,
                          color: block.content.textColor,
                          padding: "8px",
                          textAlign: block.content.alignment,
                        }}
                      >
                        {block.type === "header" && <h3 className="font-bold">{block.content.text}</h3>}
                        {block.type === "text" && <p className="text-sm">{block.content.text}</p>}
                        {block.type === "image" && (
                          <div className="text-xs text-muted-foreground">
                            {block.content.imageUrl || "No image URL"}
                          </div>
                        )}
                        {block.type === "button" && (
                          <button className="px-4 py-2 bg-blue-500 text-white rounded text-sm">
                            {block.content.buttonText}
                          </button>
                        )}
                        {block.type === "divider" && <hr />}
                        {block.type === "spacer" && <div className="text-xs text-muted-foreground">Spacer</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        )}

        {mobileTab === "properties" && (
          <Card className="p-4 flex flex-col flex-1 overflow-hidden">
            <h3 className="font-semibold mb-4">Properties</h3>
            <ScrollArea className="flex-1">
              {!selectedBlock ? (
                <div className="text-center text-muted-foreground py-12">
                  <p>Select a block from Canvas to edit</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(selectedBlock.type === "header" || selectedBlock.type === "text") && (
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Textarea
                        value={selectedBlock.content.text}
                        onChange={(e) => updateBlock(selectedBlock.id, { text: e.target.value })}
                        rows={6}
                        className="text-base"
                      />
                    </div>
                  )}

                  {selectedBlock.type === "image" && (
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={selectedBlock.content.imageUrl || ""}
                        onChange={(e) => updateBlock(selectedBlock.id, { imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="text-base"
                      />
                    </div>
                  )}

                  {selectedBlock.type === "button" && (
                    <>
                      <div className="space-y-2">
                        <Label>Button Text</Label>
                        <Input
                          value={selectedBlock.content.buttonText}
                          onChange={(e) => updateBlock(selectedBlock.id, { buttonText: e.target.value })}
                          className="text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button URL</Label>
                        <Input
                          value={selectedBlock.content.buttonUrl}
                          onChange={(e) => updateBlock(selectedBlock.id, { buttonUrl: e.target.value })}
                          placeholder="https://example.com"
                          className="text-base"
                        />
                      </div>
                    </>
                  )}

                  {selectedBlock.type !== "divider" && selectedBlock.type !== "spacer" && (
                    <>
                      <div className="space-y-2">
                        <Label>Alignment</Label>
                        <Select
                          value={selectedBlock.content.alignment}
                          onValueChange={(value: any) => updateBlock(selectedBlock.id, { alignment: value })}
                        >
                          <SelectTrigger className="text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Background Color</Label>
                        <Input
                          type="color"
                          value={selectedBlock.content.backgroundColor}
                          onChange={(e) => updateBlock(selectedBlock.id, { backgroundColor: e.target.value })}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Text Color</Label>
                        <Input
                          type="color"
                          value={selectedBlock.content.textColor}
                          onChange={(e) => updateBlock(selectedBlock.id, { textColor: e.target.value })}
                          className="h-12"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label>Padding</Label>
                    <Input
                      value={selectedBlock.content.padding}
                      onChange={(e) => updateBlock(selectedBlock.id, { padding: e.target.value })}
                      placeholder="20px"
                      className="text-base"
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    size="lg"
                    onClick={() => setMobileTab("canvas")}
                  >
                    Back to Canvas
                  </Button>
                </div>
              )}
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  )
}
