import React, { useState } from "react";
import { useSession, getSession } from "next-auth/react";
import Layout from "../components/Layout";
import Router from "next/router";

const Draft: React.FC = () => {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Show loading state while session is being fetched
  if (status === "loading") {
    return <Layout>Loading...</Layout>;
  }

  // Redirect to sign in if not authenticated
  if (status === "unauthenticated") {
    return (
      <Layout>
        <div>
          <h1>Access Denied</h1>
          <p>You need to be signed in to create a post.</p>
          <button onClick={() => Router.push("/api/auth/signin")}>
            Sign In
          </button>
        </div>
      </Layout>
    );
  }

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const body = { title, content };
      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (response.ok) {
        await Router.push("/drafts");
      } else {
        const errorData = await response.json();
        console.error("Failed to create post:", errorData);
        alert("Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <Layout>
      <div>
        <form onSubmit={submitData}>
          <h1>New Draft</h1>
          <p>Signed in as: {session?.user?.email || session?.user?.name}</p>
          <input
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            type="text"
            value={title}
          />
          <textarea
            cols={50}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            rows={8}
            value={content}
          />
          <input disabled={!content || !title} type="submit" value="Create" />
          <a className="back" href="#" onClick={() => Router.push("/")}>
            or Cancel
          </a>
        </form>
      </div>
      <style jsx>{`
        .page {
          background: var(--geist-background);
          padding: 3rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        input[type="text"],
        textarea {
          width: 100%;
          padding: 0.5rem;
          margin: 0.5rem 0;
          border-radius: 0.25rem;
          border: 0.125rem solid rgba(0, 0, 0, 0.2);
        }

        input[type="submit"] {
          background: #ececec;
          border: 0;
          padding: 1rem 2rem;
        }

        .back {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  );
};

export default Draft;
