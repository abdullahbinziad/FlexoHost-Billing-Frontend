"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileArchive, CheckCircle2, XCircle, Database } from "lucide-react";
import { toast } from "sonner";
import { uploadAndMigrateWhmcs, type MigrationResult } from "@/store/api/whmcsMigrationApi";

export default function AdminMigrationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".sql") || f.name.endsWith(".zip"))) {
      setFile(f);
      setResult(null);
    } else {
      toast.error("Please upload a .sql or .zip file");
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && (f.name.endsWith(".sql") || f.name.endsWith(".zip"))) {
      setFile(f);
      setResult(null);
    } else if (f) {
      toast.error("Please select a .sql or .zip file");
    }
  };

  const handleRun = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    setIsRunning(true);
    setResult(null);
    try {
      const res = await uploadAndMigrateWhmcs(file);
      setResult(res);
      if (res.success) {
        toast.success("Migration completed successfully");
      } else {
        toast.error(res.error || "Migration failed");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Migration failed";
      setResult({ success: false, error: msg });
      toast.error(msg);
    } finally {
      setIsRunning(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">WHMCS Migration</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Upload your WHMCS SQL dump to import and migrate data to FlexoHost.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Upload SQL Dump
          </CardTitle>
          <CardDescription>
            Upload a .sql or .sql.zip file. Max 200MB. Ensure WHMCS_MYSQL_* variables are set in backend .env.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
          >
            <input
              type="file"
              accept=".sql,.zip"
              onChange={handleFileChange}
              className="hidden"
              id="whmcs-file"
            />
            <label htmlFor="whmcs-file" className="cursor-pointer block">
              <FileArchive className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">
                {file ? file.name : "Drop your file here or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">.sql or .zip (max 200MB)</p>
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleRun}
              disabled={!file || isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing & migrating…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import & Migrate
                </>
              )}
            </Button>
            {(file || result) && (
              <Button variant="outline" onClick={clearFile} disabled={isRunning}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Migration Result
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-destructive" />
                  Migration Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!result.success && result.error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                {result.error}
              </div>
            )}
            {result.success && result.migration && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {typeof result.migration.clients === "object" && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Clients</p>
                    <p className="text-lg font-semibold">
                      {(result.migration.clients as { clients?: number }).clients ?? 0} clients,{" "}
                      {(result.migration.clients as { users?: number }).users ?? 0} users
                    </p>
                  </div>
                )}
                {typeof result.migration.products === "number" && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Products</p>
                    <p className="text-lg font-semibold">{result.migration.products}</p>
                  </div>
                )}
                {typeof result.migration.servers === "number" && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Servers</p>
                    <p className="text-lg font-semibold">{result.migration.servers}</p>
                  </div>
                )}
                {typeof result.migration.orders === "number" && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Orders</p>
                    <p className="text-lg font-semibold">{result.migration.orders}</p>
                  </div>
                )}
                {typeof result.migration.invoices === "number" && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Invoices</p>
                    <p className="text-lg font-semibold">{result.migration.invoices}</p>
                  </div>
                )}
                {typeof result.migration.services === "number" && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Services</p>
                    <p className="text-lg font-semibold">{result.migration.services}</p>
                  </div>
                )}
                {typeof result.migration.transactions === "number" && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Transactions</p>
                    <p className="text-lg font-semibold">{result.migration.transactions}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
