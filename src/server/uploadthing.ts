import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  imageUpload: f({
    image: { maxFileSize: "16MB", maxFileCount: 1 },
  }).onUploadComplete(() => {
    console.log("Upload complete!");
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
