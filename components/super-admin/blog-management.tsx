"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Bold,
  Italic,
  LinkIcon,
  Heading1,
  Heading2,
  List,
  Code,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image_url?: string
  category_id?: string
  category?: { id: string; name: string; slug: string }
  author_name: string
  status: "draft" | "published" | "archived"
  is_featured: boolean
  published_at?: string
  read_time_minutes?: number
  views_count: number
  created_at: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
  og_title?: string
  og_description?: string
  og_image?: string
  twitter_card_type?: "summary" | "summary_large_image" | "app" | "player"
}

interface Category {
  id: string
  name: string
  slug: string
}

export function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image_url: "",
    category_id: "",
    status: "draft" as "draft" | "published" | "archived",
    is_featured: false,
    read_time_minutes: 5,
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    twitter_card_type: "summary_large_image" as "summary" | "summary_large_image" | "app" | "player",
  })
  const [showMarkdownGuide, setShowMarkdownGuide] = useState(false)
  const [showSeoSection, setShowSeoSection] = useState(false)

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/super-admin/blog/posts")
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error("[v0] Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/super-admin/blog/categories")
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error("[v0] Error fetching categories:", error)
    }
  }

  const handleCreatePost = () => {
    setEditingPost(null)
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image_url: "",
      category_id: "",
      status: "draft",
      is_featured: false,
      read_time_minutes: 5,
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      og_title: "",
      og_description: "",
      og_image: "",
      twitter_card_type: "summary_large_image",
    })
    setDialogOpen(true)
  }

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      featured_image_url: post.featured_image_url || "",
      category_id: post.category_id || "",
      status: post.status,
      is_featured: post.is_featured,
      read_time_minutes: post.read_time_minutes || 5,
      meta_title: (post as any).meta_title || "",
      meta_description: (post as any).meta_description || "",
      meta_keywords: (post as any).meta_keywords?.join(", ") || "",
      og_title: (post as any).og_title || "",
      og_description: (post as any).og_description || "",
      og_image: (post as any).og_image || "",
      twitter_card_type: (post as any).twitter_card_type || "summary_large_image",
    })
    setDialogOpen(true)
  }

  const handleSavePost = async () => {
    try {
      const url = editingPost ? `/api/super-admin/blog/posts/${editingPost.id}` : "/api/super-admin/blog/posts"
      const method = editingPost ? "PATCH" : "POST"

      const payload = {
        ...formData,
        meta_keywords: formData.meta_keywords
          ? formData.meta_keywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean)
          : [],
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save post")

      await fetchPosts()
      setDialogOpen(false)
    } catch (error) {
      console.error("[v0] Error saving post:", error)
      alert("Failed to save post")
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const response = await fetch(`/api/super-admin/blog/posts/${postId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete post")

      await fetchPosts()
    } catch (error) {
      console.error("[v0] Error deleting post:", error)
      alert("Failed to delete post")
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const insertMarkdown = (syntax: string, placeholder = "") => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    const textToInsert = selectedText || placeholder

    let newText = ""
    let cursorOffset = 0

    switch (syntax) {
      case "bold":
        newText = `**${textToInsert}**`
        cursorOffset = selectedText ? newText.length : 2
        break
      case "italic":
        newText = `*${textToInsert}*`
        cursorOffset = selectedText ? newText.length : 1
        break
      case "h1":
        newText = `# ${textToInsert}`
        cursorOffset = selectedText ? newText.length : 2
        break
      case "h2":
        newText = `## ${textToInsert}`
        cursorOffset = selectedText ? newText.length : 3
        break
      case "link":
        newText = `[${textToInsert || "link text"}](url)`
        cursorOffset = selectedText ? newText.length - 4 : newText.length - 4
        break
      case "list":
        newText = `- ${textToInsert}`
        cursorOffset = selectedText ? newText.length : 2
        break
      case "code":
        newText = `\`${textToInsert}\``
        cursorOffset = selectedText ? newText.length : 1
        break
    }

    const newContent = formData.content.substring(0, start) + newText + formData.content.substring(end)
    setFormData({ ...formData, content: newContent })

    // Set cursor position after insert
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset)
    }, 0)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-sm text-muted-foreground">Create and manage blog posts</p>
        </div>
        <Button onClick={handleCreatePost}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              {post.featured_image_url && (
                <img
                  src={post.featured_image_url || "/placeholder.svg"}
                  alt={post.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
              )}
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                <Badge
                  variant={post.status === "published" ? "default" : post.status === "draft" ? "secondary" : "outline"}
                >
                  {post.status}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                {post.category && <p>Category: {post.category.name}</p>}
                <p>By {post.author_name}</p>
                {post.published_at && <p>Published: {new Date(post.published_at).toLocaleDateString()}</p>}
                {post.is_featured && (
                  <Badge variant="outline" className="text-xs">
                    Featured
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditPost(post)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeletePost(post.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first blog post to get started</p>
          <Button onClick={handleCreatePost}>
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
            <DialogDescription>{editingPost ? "Update your blog post" : "Create a new blog post"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: generateSlug(e.target.value),
                  })
                }}
                placeholder="Enter post title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="post-url-slug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary of the post"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content (Markdown supported)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMarkdownGuide(!showMarkdownGuide)}
                  className="text-xs"
                >
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Markdown Guide
                  {showMarkdownGuide ? (
                    <ChevronUp className="w-3 h-3 ml-1" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-1" />
                  )}
                </Button>
              </div>

              <Collapsible open={showMarkdownGuide} onOpenChange={setShowMarkdownGuide}>
                <CollapsibleContent>
                  <Card className="mb-3 bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-semibold mb-2">Text Formatting</h4>
                          <div className="space-y-1 font-mono text-xs">
                            <p>
                              <span className="text-muted-foreground">Bold:</span> **bold text**
                            </p>
                            <p>
                              <span className="text-muted-foreground">Italic:</span> *italic text*
                            </p>
                            <p>
                              <span className="text-muted-foreground">Bold + Italic:</span> ***bold italic***
                            </p>
                            <p>
                              <span className="text-muted-foreground">Strikethrough:</span> ~~strikethrough~~
                            </p>
                            <p>
                              <span className="text-muted-foreground">Inline Code:</span> `code`
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Headings</h4>
                          <div className="space-y-1 font-mono text-xs">
                            <p>
                              <span className="text-muted-foreground">Heading 1:</span> # Heading 1
                            </p>
                            <p>
                              <span className="text-muted-foreground">Heading 2:</span> ## Heading 2
                            </p>
                            <p>
                              <span className="text-muted-foreground">Heading 3:</span> ### Heading 3
                            </p>
                            <p>
                              <span className="text-muted-foreground">Heading 4:</span> #### Heading 4
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Links & Images</h4>
                          <div className="space-y-1 font-mono text-xs">
                            <p>
                              <span className="text-muted-foreground">Link:</span> [text](url)
                            </p>
                            <p>
                              <span className="text-muted-foreground">Image:</span> ![alt](image-url)
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Lists</h4>
                          <div className="space-y-1 font-mono text-xs">
                            <p>
                              <span className="text-muted-foreground">Bullet:</span> - item
                            </p>
                            <p>
                              <span className="text-muted-foreground">Numbered:</span> 1. item
                            </p>
                            <p>
                              <span className="text-muted-foreground">Nested:</span> {"  "}- sub-item
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Quotes & Code</h4>
                          <div className="space-y-1 font-mono text-xs">
                            <p>
                              <span className="text-muted-foreground">Quote:</span> {"> quote text"}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Code Block:</span> \`\`\`language
                            </p>
                            <p className="pl-4">code here</p>
                            <p>\`\`\`</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Other</h4>
                          <div className="space-y-1 font-mono text-xs">
                            <p>
                              <span className="text-muted-foreground">Horizontal Rule:</span> ---
                            </p>
                            <p>
                              <span className="text-muted-foreground">Line Break:</span> {"  "} (2 spaces)
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/50 mb-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("bold", "bold text")}
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("italic", "italic text")}
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("h1", "Heading 1")}
                  title="Heading 1"
                >
                  <Heading1 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("h2", "Heading 2")}
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("link")}
                  title="Insert Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("list", "list item")}
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("code", "code")}
                  title="Inline Code"
                >
                  <Code className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog post content here... Use markdown for formatting:&#10;# Heading 1&#10;## Heading 2&#10;**bold** *italic*&#10;[link text](url)&#10;- bullet list"
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use markdown syntax for formatting. Click the buttons above to insert common formats or view the
                Markdown Guide.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="featured_image">Featured Image URL</Label>
              <Input
                id="featured_image"
                value={formData.featured_image_url}
                onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "draft" | "published" | "archived") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="read_time">Read Time (minutes)</Label>
                <Input
                  id="read_time"
                  type="number"
                  value={formData.read_time_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, read_time_minutes: Number.parseInt(e.target.value) || 5 })
                  }
                  min="1"
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="featured">Featured Post</Label>
              </div>
            </div>

            <div className="border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowSeoSection(!showSeoSection)}
                className="w-full justify-between"
              >
                <span className="font-semibold">SEO & Social Sharing Settings</span>
                {showSeoSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              <Collapsible open={showSeoSection} onOpenChange={setShowSeoSection}>
                <CollapsibleContent>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="meta_title">Meta Title (SEO)</Label>
                      <Input
                        id="meta_title"
                        value={formData.meta_title}
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                        placeholder="Leave blank to use post title"
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended: 50-60 characters. Appears in search results.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                      <Textarea
                        id="meta_description"
                        value={formData.meta_description}
                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                        placeholder="Leave blank to use excerpt"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended: 150-160 characters. Appears in search results.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta_keywords">Meta Keywords (SEO)</Label>
                      <Input
                        id="meta_keywords"
                        value={formData.meta_keywords}
                        onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                        placeholder="church management, ministry, stewardship (comma-separated)"
                      />
                      <p className="text-xs text-muted-foreground">Comma-separated keywords for search engines.</p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Social Sharing (Open Graph & Twitter)</h4>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="og_title">Social Share Title</Label>
                          <Input
                            id="og_title"
                            value={formData.og_title}
                            onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                            placeholder="Leave blank to use post title"
                          />
                          <p className="text-xs text-muted-foreground">
                            Title shown when shared on Facebook, Twitter, LinkedIn, etc.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="og_description">Social Share Description</Label>
                          <Textarea
                            id="og_description"
                            value={formData.og_description}
                            onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                            placeholder="Leave blank to use excerpt"
                            rows={3}
                          />
                          <p className="text-xs text-muted-foreground">
                            Description shown when shared on social media.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="og_image">Social Share Image URL</Label>
                          <Input
                            id="og_image"
                            value={formData.og_image}
                            onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                            placeholder="Leave blank to use featured image"
                          />
                          <p className="text-xs text-muted-foreground">
                            Recommended: 1200x630px. Image shown when shared on social media.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="twitter_card_type">Twitter Card Type</Label>
                          <Select
                            value={formData.twitter_card_type}
                            onValueChange={(value: any) => setFormData({ ...formData, twitter_card_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="summary">Summary (small image)</SelectItem>
                              <SelectItem value="summary_large_image">Summary Large Image (recommended)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            How the post appears when shared on Twitter/X.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSavePost} className="flex-1">
                {editingPost ? "Update Post" : "Create Post"}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
