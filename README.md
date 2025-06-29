# Threads 100 Clone

A minimal, hackable text-based social web app (like Threads) using HTML, JS, CSS, and [Supabase](https://supabase.com) for backend.

## Setup

1. **Clone/Download** this repo to your Termux or local environment.

2. **Set Up Supabase**:
   - Go to [Supabase](https://app.supabase.com), create a project.
   - Create a table called `threads`:
     - Columns: 
       - `id` (uuid, primary key, default uuid_generate_v4())
       - `content` (text)
       - `user_id` (uuid)
       - `created_at` (timestamp, default now())
       - `image_urls` (text[], nullable, **optional, for images**)
       - `video_urls` (text[], nullable, **optional, for videos**)
     - To support image and video uploads, add `image_urls` and `video_urls` as arrays of text (or jsonb for flexibility).
   - Create a table called `replies`:
     - Columns: `id` (uuid, primary key), `thread_id` (uuid), `content` (text), `user_id` (uuid), `created_at` (timestamp)
   - Enable Auth (email/password).

   - (Optional) Set up a Supabase Storage bucket for media uploads (images/videos). Name it `media` or similar.

3. **Configure Supabase Keys**:
   - Edit `js/supabase.js` and set your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

4. **Run**:
   - Open `index.html` in your browser or use a local web server (recommended: `python3 -m http.server`).
   - Edit files with your favorite Termux editor (vim, nano, micro, etc.).

## Posting Rules

- To create a post (thread), **users must provide a text description AND at least one image or video**.
- It's not possible to post:
  - Only text (must have image/video)
  - Only image/video (must have description)
  - Only images and videos without a description
- Both images and videos can be uploaded in a single post.
- A video or photo cannot be posted without a description.

## File Structure

```
index.html
login.html
register.html
post.html
thread.html
profile.html
/js/
  supabase.js
  main.js
  feed.js
  auth.js
  register.js
  post.js
  profile.js
  thread.js
/css/
  main.css
  feed.css
  auth.css
  profile.css
  reply-card.css
/components/
  navbar.html
  thread-card.html
  reply-card.html
/assets/ (optional: logo, icons)
```

## Customization

- **Edit HTML/CSS/JS** directly in Termux.
- **Add fields** to tables or new features by expanding JS and HTML files.
- **All files are independent and hackable!**

## License

MIT
