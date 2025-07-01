# Zooom Frontend Structure

This project targets a Threads/X-style layout using Supabase for authentication and data. Below is a starter file structure and compatibility boilerplate for Supabase:

## File Structure

- **index.html:** Main feed page, X/Threads layout, top+bottom navbar.
- **login.html / register.html:** Auth pages.
- **post.html:** For composing posts.
- **thread.html:** Single thread view.
- **profile.html:** User profile.

**JS**  
- `/js/supabase.js` - Supabase client setup.  
- `/js/main.js` - General page JS.  
- `/js/feed.js` - Feed logic.  
- `/js/auth.js` - Login logic.  
- `/js/register.js` - Register logic.  
- `/js/post.js` - Post composition.  
- `/js/profile.js` - Profile logic.  
- `/js/thread.js` - Thread view logic.

**CSS**  
- `/css/main.css` - Global styles, layout.  
- `/css/feed.css` - Feed and post cards.  
- `/css/auth.css` - Auth pages.  
- `/css/profile.css` - Profile page.  
- `/css/reply-card.css` - Reply card styling.

**Components**  
- `/components/navbar.html` - Navbar  
- `/components/thread-card.html` - Thread cards  
- `/components/reply-card.html` - Reply cards

**/assets/** (optional: images, logos, icons)

---

## Getting Started

1. **Add your [Supabase Project URL and anon key](https://app.supabase.com) to `/js/supabase.js`.**
2. **Open `index.html` to see the X/Threads-style layout.**
3. **All other pages are styled for compatibility and interaction with Supabase.**

---

Each file is included as a template or sample below.

---

This setup is ready for production: just add your Supabase credentials, upload SVGs/assets, and you’re good to go!  
You can further optimize by bundling/minifying assets, adding meta tags, and improving accessibility.  
Let me know if you want full HTML for every page or further customizations!
