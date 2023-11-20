import Head from "next/head";

import FormMenu from "@/components/menu/FormMenu";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Home</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-slate-100">
        <div className="mt-12">
          <FormMenu />
        </div>
      </main>
    </>
  );
}
