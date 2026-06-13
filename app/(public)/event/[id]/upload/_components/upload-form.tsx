"use client";

import * as React from "react";
import { requestGuestUploadUrl, submitGuestWish } from "@/app/actions/guest-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CameraIcon,
  CheckCircleIcon,
  HeartIcon,
  ArrowRightIcon,
  CalendarIcon,
  WarningIcon,
  SparkleIcon,
  SpinnerGapIcon
} from "@phosphor-icons/react";

interface UploadFormProps {
  id: string;
  initialEvent: any;
}

export function UploadForm({ id, initialEvent }: UploadFormProps) {
  const [eventData] = React.useState<any>(initialEvent);
  
  const [guestName, setGuestName] = React.useState("");
  const [wish, setWish] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState("");
  
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [actionError, setActionError] = React.useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle file select/capture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setActionError("Please upload an image file.");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setActionError("Image size must be smaller than 10MB.");
        return;
      }
      setFile(selectedFile);
      setActionError("");
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  // Submit flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setActionError("Please take or select a photo.");
      return;
    }
    if (!guestName.trim()) {
      setActionError("Please sign your name.");
      return;
    }
    if (!wish.trim()) {
      setActionError("Please leave a short message/wish.");
      return;
    }

    setIsUploading(true);
    setActionError("");
    setUploadProgress(10);

    try {
      // 1. Request presigned upload URL
      const presignedRes = await requestGuestUploadUrl({
        eventId: id,
        filename: file.name,
        contentType: file.type,
      });

      if (presignedRes.error) {
        setActionError(presignedRes.error);
        setIsUploading(false);
        return;
      }

      const { uploadUrl, key } = presignedRes;
      setUploadProgress(40);

      // 2. Upload to R2 directly from browser
      const uploadXhr = new XMLHttpRequest();
      uploadXhr.open("PUT", uploadUrl!, true);
      uploadXhr.setRequestHeader("Content-Type", file.type);

      uploadXhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 40);
          setUploadProgress(40 + percentComplete); // goes up to 80%
        }
      };

      const uploadResult = await new Promise<{ success: boolean; error?: string }>((resolve) => {
        uploadXhr.onload = () => {
          if (uploadXhr.status === 200) {
            resolve({ success: true });
          } else {
            resolve({ success: false, error: "Failed to upload image to storage server." });
          }
        };
        uploadXhr.onerror = () => resolve({ success: false, error: "Network error during upload." });
        uploadXhr.send(file);
      });

      if (!uploadResult.success) {
        setActionError(uploadResult.error || "Failed uploading photo.");
        setIsUploading(false);
        return;
      }

      setUploadProgress(90);

      // 3. Submit guestbook wish details to database
      const wishRes = await submitGuestWish({
        eventId: id,
        guestName: guestName.trim(),
        wish: wish.trim(),
        imageKey: key!,
      });

      if (wishRes.error) {
        setActionError(wishRes.error);
        setIsUploading(false);
        return;
      }

      setUploadProgress(100);
      setSubmitSuccess(true);
    } catch (err: any) {
      console.error(err);
      setActionError("An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="size-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary">
            <CheckCircleIcon weight="fill" className="size-10" />
          </div>
          <SparkleIcon className="size-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          <HeartIcon weight="fill" className="size-5 text-primary absolute -bottom-1 -left-1 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Memory Captured!</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
          Thank you so much! Your polaroid and warm wishes have been signed and pinned onto the event live wall.
        </p>

        {/* Polaroid frame preview of the submission */}
        <div className="mt-8 bg-white p-3 pb-8 shadow-2xl rounded border border-neutral-100 flex flex-col items-center w-full max-w-[220px] text-slate-800 rotate-2">
          <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 border">
            {imagePreview && (
              <img src={imagePreview} alt="Polaroid Memory" className="object-cover w-full h-full" />
            )}
          </div>
          <div className="mt-4 text-center font-serif text-xs font-semibold max-w-full truncate">
            ✍️ {guestName}
          </div>
        </div>

        <Button
          onClick={() => {
            setFile(null);
            setImagePreview("");
            setWish("");
            setSubmitSuccess(false);
            setUploadProgress(0);
          }}
          className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer active:scale-95 transition-all text-xs"
        >
          Submit Another Polaroid
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start py-8 px-4 overflow-y-auto w-full">
      {/* Event Banner */}
      <div className="w-full max-w-md text-center mb-6 px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3 text-primary text-[10px] uppercase font-bold tracking-wider">
          <SparkleIcon weight="fill" className="size-3" />
          Polaroid Guestbook
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{eventData.name}</h1>
        <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
          <CalendarIcon className="size-3.5" />
          Scheduled for {eventData.date}
        </p>
      </div>

      <Card className="w-full max-w-md bg-card border-border/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Colorful top border using primary */}
        <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />
        
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-foreground">Capture &amp; Sign the Guestbook</CardTitle>
          {eventData.welcomeMessage && (
            <CardDescription className="text-xs text-muted-foreground leading-relaxed font-serif italic mt-1.5">
              "{eventData.welcomeMessage}"
            </CardDescription>
          )}
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {/* Action Messages */}
            {actionError && (
              <div className="p-3 bg-destructive/15 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-1.5">
                <WarningIcon className="size-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Photo Capture Section */}
            <div className="flex flex-col items-center gap-4">
              <Label className="text-xs font-semibold text-foreground self-start">
                Snap or Upload a Guest Photo
              </Label>
              
              {/* Camera Frame */}
              <div 
                onClick={!isUploading ? triggerCamera : undefined}
                className={`relative aspect-square w-full max-w-[240px] rounded-2xl border-2 border-dashed ${
                  imagePreview ? "border-solid border-border bg-white p-3 pb-8" : "border-border/60 bg-muted/20 hover:bg-muted/40"
                } flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden`}
              >
                {imagePreview ? (
                  // Custom Polaroid Preview Frame
                  <div className="w-full h-full flex flex-col items-center bg-white text-slate-800 justify-between">
                    <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 border">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="object-cover w-full h-full filter sepia-[0.05]" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
                        <CameraIcon className="size-5 mr-1" /> Retake Photo
                      </div>
                    </div>
                    <div className="mt-3 text-center font-serif text-[11px] font-bold tracking-tight text-slate-600 truncate max-w-full">
                      ✍️ {guestName || "Your Signature"}
                    </div>
                  </div>
                ) : (
                  // Capture Trigger Placeholder
                  <div className="flex flex-col items-center gap-2.5 text-center px-4 py-8">
                    <div className="p-4 rounded-full bg-muted border border-border text-primary group-hover:scale-105 transition-transform duration-300">
                      <CameraIcon className="size-8" />
                    </div>
                    <span className="text-xs font-medium text-foreground">Tap to Snap Polaroid</span>
                    <span className="text-[10px] text-muted-foreground">Opens phone camera or file browser</span>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  type="file"
                  id="guest-photo"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment" // Forces back camera on mobile
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
            </div>

            {/* Guest Signature Name */}
            <div className="grid gap-1.5">
              <Label htmlFor="guest-name" className="text-xs font-semibold text-foreground">
                Your Name / Signature
              </Label>
              <Input
                id="guest-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Uncle George, Chloe & Ryan"
                disabled={isUploading}
                maxLength={50}
                required
                className="bg-muted/30 border-border/60 focus-visible:ring-primary focus-visible:ring-offset-0 text-foreground text-xs h-9 placeholder:text-muted-foreground"
              />
            </div>

            {/* Guest Wish Message */}
            <div className="grid gap-1.5">
              <Label htmlFor="guest-wish" className="text-xs font-semibold text-foreground">
                Your Wedding Message / Wish
              </Label>
              <textarea
                id="guest-wish"
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                placeholder="Write your wishes here. It will be printed under your polaroid on the wedding wall!"
                disabled={isUploading}
                maxLength={500}
                required
                rows={3}
                className="flex min-h-[70px] w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <SpinnerGapIcon className="size-3.5 animate-spin text-primary" />
                    {uploadProgress < 40 ? "Initializing..." : uploadProgress < 85 ? "Uploading Polaroid..." : "Hanging on wall..."}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden w-full">
                  <div 
                    className="h-full bg-primary transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t border-border/40 pt-4 pb-5 flex gap-2">
            <Button
              type="submit"
              disabled={isUploading || !file}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer active:scale-95 transition-all text-xs h-9.5 gap-1.5 shadow-md shadow-primary/10"
            >
              Sign guestbook
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
