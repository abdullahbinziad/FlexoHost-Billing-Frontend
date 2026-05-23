"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsPageFrame } from "@/components/admin/settings";
import {
  type ManagedEmailTemplate,
  useGetManagedEmailTemplatesQuery,
  usePreviewManagedEmailTemplateMutation,
  useResetEmailTemplateOverrideMutation,
  useSaveEmailTemplateOverrideMutation,
} from "@/store/api/emailApi";

export default function EmailTemplatesSettingsPage() {
  const { data, isLoading, error } = useGetManagedEmailTemplatesQuery();
  const [selectedKey, setSelectedKey] = useState("");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [html, setHtml] = useState("");
  const [text, setText] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [saveOverride, { isLoading: isSaving }] = useSaveEmailTemplateOverrideMutation();
  const [resetOverride, { isLoading: isResetting }] = useResetEmailTemplateOverrideMutation();
  const [previewTemplate, { isLoading: isPreviewing }] = usePreviewManagedEmailTemplateMutation();

  const templates = data?.templates ?? [];
  const selected = useMemo(
    () => templates.find((item) => item.key === selectedKey) || templates[0],
    [selectedKey, templates]
  );

  useEffect(() => {
    if (!selected) return;
    setSelectedKey(selected.key);
    setSubject(selected.override?.subject || selected.defaultSubjectPreview || "");
    setPreviewText(selected.override?.previewText || selected.defaultPreviewText || "");
    setHtml(selected.override?.html || selected.defaultHtml || "");
    setText(selected.override?.text || selected.defaultText || "");
    setEnabled(selected.override?.enabled ?? true);
    setPreviewHtml("");
    setPreviewError("");
  }, [selected?.key, selected?.override]);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const result = await previewTemplate({
          templateKey: selected.key,
          draft: { enabled, subject, previewText, html, text },
        }).unwrap();
        if (cancelled) return;
        setPreviewHtml(result.html);
        setPreviewError("");
      } catch (err: any) {
        if (cancelled) return;
        setPreviewError(err?.data?.message || "Failed to render preview.");
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled, html, previewTemplate, previewText, selected, subject, text]);

  const handleSave = async () => {
    if (!selected) return;
    try {
      await saveOverride({
        templateKey: selected.key,
        data: { enabled, subject, previewText, html, text },
      }).unwrap();
      toast.success("Email template override saved.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save template.");
    }
  };

  const handleReset = async () => {
    if (!selected) return;
    try {
      await resetOverride(selected.key).unwrap();
      toast.success("Template override reset.");
      setPreviewHtml("");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reset template.");
    }
  };

  const copyVariable = async (name: string) => {
    const token = `{{${name}}}`;
    try {
      await navigator.clipboard.writeText(token);
      toast.success(`${token} copied`);
    } catch {
      setHtml((current) => `${current}\n${token}`);
      toast.success(`${token} added to HTML editor`);
    }
  };

  if (isLoading) {
    return <div className="flex h-[360px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="p-6 text-destructive">Failed to load email templates.</div>;
  }

  return (
    <SettingsPageFrame
      title="Email Templates"
      description="Preview default transactional templates and save optional admin overrides with {{placeholders}}."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={!selected?.override || isResetting}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!selected || isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Card>
          <CardContent className="grid gap-3 pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Email Template</label>
              <Select value={selected?.key || ""} onValueChange={setSelectedKey}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template: ManagedEmailTemplate) => (
                    <SelectItem key={template.key} value={template.key}>
                      {template.key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {selected ? <Badge variant="outline">{selected.category}</Badge> : null}
              {selected?.override ? <Badge variant="secondary">Custom override</Badge> : <Badge variant="outline">Default</Badge>}
              {isPreviewing ? (
                <span className="inline-flex items-center text-xs text-muted-foreground">
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Rendering
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1">
                <h3 className="text-base font-semibold">Template Content</h3>
                <p className="text-sm text-muted-foreground">Default values are prefilled; edit only the parts you need.</p>
              </div>

              <div className="space-y-2 rounded-md border p-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
                  Override enabled
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Subject</label>
                <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder={selected?.defaultSubjectPreview || "Default subject"} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Inbox Preview Text</label>
                <Input value={previewText} onChange={(event) => setPreviewText(event.target.value)} placeholder={selected?.defaultPreviewText || "Inbox preview text"} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Plain Text</label>
                <Textarea className="min-h-[220px] font-mono text-xs" value={text} onChange={(event) => setText(event.target.value)} placeholder={selected?.defaultText || "Hello {{customerName}}"} />
              </div>

              <div className="space-y-2 rounded-md border p-3">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Available Variables</h4>
                  <p className="text-xs text-muted-foreground">Click a variable to copy it, then paste it in Subject, HTML, or Plain Text.</p>
                </div>
                <div className="flex max-h-44 flex-wrap gap-1.5 overflow-auto">
                  {(selected?.availableVariables || []).map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => copyVariable(variable)}
                      className="rounded border bg-muted/40 px-2 py-1 font-mono text-[11px] hover:bg-muted"
                    >
                      {`{{${variable}}}`}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="preview">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="visual">Visual Editor</TabsTrigger>
                    <TabsTrigger value="html">HTML Editor</TabsTrigger>
                  </TabsList>
                  {previewError ? <span className="text-xs text-destructive">{previewError}</span> : null}
                </div>

                <TabsContent value="preview">
                  <iframe title="Email preview" srcDoc={previewHtml} className="h-[760px] w-full rounded-md border bg-white" />
                </TabsContent>

                <TabsContent value="visual">
                  <div className="space-y-2">
                    <div
                      key={selected?.key || "visual-editor"}
                      contentEditable
                      suppressContentEditableWarning
                      className="h-[760px] overflow-auto rounded-md border bg-white p-4 text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-ring"
                      dangerouslySetInnerHTML={{ __html: html }}
                      onBlur={(event) => setHtml(event.currentTarget.innerHTML)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Edit visible text here, then click outside the editor to sync it into the HTML template.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="html">
                  <Textarea
                    className="min-h-[760px] font-mono text-xs"
                    value={html}
                    onChange={(event) => setHtml(event.target.value)}
                    placeholder={selected?.defaultHtml || "<p>Hello {{customerName}},</p>"}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </SettingsPageFrame>
  );
}
