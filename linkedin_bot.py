"""
LinkedIn Bot - Real browser automation using Playwright.
Logs into LinkedIn with real credentials and performs actions:
  - Search for people by niche/keywords
  - Send messages / connection requests
  - Search for posts by topic
  - Comment on posts
  - Message post authors
"""

import asyncio
import random
import re
import logging
from typing import List, Dict, Optional, Any

from playwright.async_api import async_playwright, Browser, Page, BrowserContext

logger = logging.getLogger(__name__)

LINKEDIN_LOGIN_URL = "https://www.linkedin.com/login"
LINKEDIN_FEED_URL = "https://www.linkedin.com/feed/"
LINKEDIN_PEOPLE_SEARCH = "https://www.linkedin.com/search/results/people/?keywords={query}&origin=GLOBAL_SEARCH_HEADER"
LINKEDIN_POSTS_SEARCH = "https://www.linkedin.com/search/results/content/?keywords={query}&origin=GLOBAL_SEARCH_HEADER"


async def _human_delay(min_s: float = 0.8, max_s: float = 2.5):
    await asyncio.sleep(random.uniform(min_s, max_s))


async def _slow_type(page: Page, selector: str, text: str):
    """Type text character by character with human-like delays."""
    await page.click(selector)
    for char in text:
        await page.keyboard.type(char, delay=random.randint(40, 120))
    await _human_delay(0.3, 0.6)


class LinkedInBot:
    """Automates LinkedIn actions using a real browser session."""

    def __init__(self):
        self.playwright = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.logged_in = False

    async def _launch(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
            ],
        )
        self.context = await self.browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="en-US",
        )
        await self.context.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
        )
        self.page = await self.context.new_page()

    async def close(self):
        try:
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()
        except Exception as e:
            logger.warning(f"Error closing browser: {e}")
        finally:
            self.logged_in = False

    # ------------------------------------------------------------------ login
    async def login(self, email: str, password: str) -> Dict[str, Any]:
        """Log in to LinkedIn with email and password. Returns success status."""
        try:
            await self._launch()

            await self.page.goto(LINKEDIN_LOGIN_URL, wait_until="domcontentloaded")
            await _human_delay(1, 2)

            await _slow_type(self.page, "#username", email)
            await _slow_type(self.page, "#password", password)
            await _human_delay(0.5, 1)

            await self.page.click('button[type="submit"]')
            await self.page.wait_for_load_state("domcontentloaded", timeout=30000)
            await _human_delay(2, 4)

            current_url = self.page.url

            if "challenge" in current_url or "checkpoint" in current_url:
                logger.warning("LinkedIn security challenge detected")
                return {
                    "success": False,
                    "error": "LinkedIn security verification required. Please log in manually first to verify your account, then try again.",
                }

            if "/login" in current_url:
                return {
                    "success": False,
                    "error": "Login failed. Please check your email and password.",
                }

            self.logged_in = True
            logger.info("LinkedIn login successful")
            return {"success": True, "message": "Logged in successfully"}

        except Exception as e:
            logger.error(f"Login error: {e}")
            return {"success": False, "error": f"Login failed: {str(e)}"}

    # --------------------------------------------------------- search people
    async def search_people(self, query: str, count: int = 10) -> Dict[str, Any]:
        """Search LinkedIn for people matching a query/niche."""
        if not self.logged_in:
            return {"success": False, "error": "Not logged in", "people": []}

        try:
            url = LINKEDIN_PEOPLE_SEARCH.format(query=query.replace(" ", "%20"))
            await self.page.goto(url, wait_until="domcontentloaded")
            await _human_delay(2, 4)

            await self.page.evaluate("window.scrollBy(0, 600)")
            await _human_delay(1, 2)
            await self.page.evaluate("window.scrollBy(0, 600)")
            await _human_delay(1, 2)

            people = await self.page.evaluate("""() => {
                const results = [];
                const cards = document.querySelectorAll('.reusable-search__result-container');
                cards.forEach(card => {
                    try {
                        const linkEl = card.querySelector('a.app-aware-link[href*="/in/"]');
                        const nameEl = card.querySelector('.entity-result__title-text a span[aria-hidden="true"]') 
                                     || card.querySelector('.entity-result__title-text a span');
                        const headlineEl = card.querySelector('.entity-result__primary-subtitle');
                        const locationEl = card.querySelector('.entity-result__secondary-subtitle');
                        const summaryEl = card.querySelector('.entity-result__summary');

                        const href = linkEl ? linkEl.getAttribute('href') : '';
                        let profileUrl = '';
                        if (href) {
                            const match = href.match(/\\/in\\/[^/?]+/);
                            profileUrl = match ? 'https://www.linkedin.com' + match[0] : '';
                        }

                        if (nameEl) {
                            results.push({
                                full_name: (nameEl.innerText || '').trim(),
                                linkedin_url: profileUrl,
                                headline: headlineEl ? headlineEl.innerText.trim() : '',
                                location: locationEl ? locationEl.innerText.trim() : '',
                                about: summaryEl ? summaryEl.innerText.trim() : '',
                            });
                        }
                    } catch(e) {}
                });
                return results;
            }""")

            people = people[:count]

            for person in people:
                person["company"] = ""
                person["role"] = person.get("headline", "")
                person["connection_degree"] = ""
                headline = person.get("headline", "")
                if " at " in headline:
                    parts = headline.split(" at ", 1)
                    person["role"] = parts[0].strip()
                    person["company"] = parts[1].strip()

            return {
                "success": True,
                "people": people,
                "total_found": len(people),
            }

        except Exception as e:
            logger.error(f"Search people error: {e}")
            return {"success": False, "error": str(e), "people": []}

    # --------------------------------------------------------- send message
    async def send_message(self, profile_url: str, message: str) -> Dict[str, Any]:
        """Navigate to a LinkedIn profile and send a message."""
        if not self.logged_in:
            return {"success": False, "error": "Not logged in"}

        try:
            await self.page.goto(profile_url, wait_until="domcontentloaded")
            await _human_delay(2, 3)

            msg_btn = await self.page.query_selector(
                'button.pvs-profile-actions__action:has-text("Message"), '
                'a.message-anywhere-button, '
                'button:has-text("Message")'
            )

            if not msg_btn:
                connect_btn = await self.page.query_selector(
                    'button:has-text("Connect"), '
                    'button.pvs-profile-actions__action:has-text("Connect")'
                )
                if connect_btn:
                    await connect_btn.click()
                    await _human_delay(1, 2)
                    add_note = await self.page.query_selector('button:has-text("Add a note")')
                    if add_note:
                        await add_note.click()
                        await _human_delay(0.5, 1)
                        textarea = await self.page.query_selector('textarea[name="message"], textarea#custom-message')
                        if textarea:
                            await textarea.fill(message)
                            await _human_delay(0.5, 1)
                        send_btn = await self.page.query_selector('button:has-text("Send")')
                        if send_btn:
                            await send_btn.click()
                            await _human_delay(1, 2)
                            return {"success": True, "method": "connection_request_with_note"}

                return {"success": False, "error": "No Message or Connect button found on profile"}

            await msg_btn.click()
            await _human_delay(1.5, 2.5)

            msg_box = await self.page.query_selector(
                'div.msg-form__contenteditable[contenteditable="true"], '
                'div[role="textbox"][contenteditable="true"]'
            )

            if not msg_box:
                await _human_delay(1, 2)
                msg_box = await self.page.query_selector(
                    'div.msg-form__contenteditable, div[role="textbox"]'
                )

            if not msg_box:
                return {"success": False, "error": "Could not find message input box"}

            await msg_box.click()
            await _human_delay(0.3, 0.5)
            await msg_box.fill(message)
            await _human_delay(0.5, 1)

            send_btn = await self.page.query_selector(
                'button.msg-form__send-button, '
                'button[type="submit"]:has-text("Send"), '
                'button.msg-form__send-btn'
            )

            if not send_btn:
                return {"success": False, "error": "Could not find Send button"}

            await send_btn.click()
            await _human_delay(1, 2)

            return {"success": True, "method": "direct_message"}

        except Exception as e:
            logger.error(f"Send message error: {e}")
            return {"success": False, "error": str(e)}

    # -------------------------------------------------------- search posts
    async def search_posts(self, query: str, count: int = 10) -> Dict[str, Any]:
        """Search LinkedIn for posts matching a query."""
        if not self.logged_in:
            return {"success": False, "error": "Not logged in", "posts": []}

        try:
            url = LINKEDIN_POSTS_SEARCH.format(query=query.replace(" ", "%20"))
            await self.page.goto(url, wait_until="domcontentloaded")
            await _human_delay(2, 4)

            for _ in range(3):
                await self.page.evaluate("window.scrollBy(0, 800)")
                await _human_delay(1, 2)

            posts = await self.page.evaluate("""() => {
                const results = [];
                const items = document.querySelectorAll('.feed-shared-update-v2, .search-content__result');
                let idx = 0;
                items.forEach(item => {
                    try {
                        const authorLink = item.querySelector('a.app-aware-link[href*="/in/"]');
                        const authorNameEl = item.querySelector('.update-components-actor__name span[aria-hidden="true"]')
                                          || item.querySelector('.feed-shared-actor__name span');
                        const headlineEl = item.querySelector('.update-components-actor__description span[aria-hidden="true"]')
                                        || item.querySelector('.feed-shared-actor__description');
                        const contentEl = item.querySelector('.feed-shared-update-v2__description .break-words span[dir="ltr"]')
                                       || item.querySelector('.feed-shared-text__text-view span');
                        const timeEl = item.querySelector('.update-components-actor__sub-description span[aria-hidden="true"]')
                                    || item.querySelector('time');

                        const likesEl = item.querySelector('.social-details-social-counts__reactions-count');
                        const commentsEl = item.querySelector('button[aria-label*="comment"] span');

                        const href = authorLink ? authorLink.getAttribute('href') : '';
                        let profileUrl = '';
                        if (href) {
                            const match = href.match(/\\/in\\/[^/?]+/);
                            profileUrl = match ? 'https://www.linkedin.com' + match[0] : '';
                        }

                        const urn = item.getAttribute('data-urn') || '';
                        let postUrl = '';
                        if (urn) {
                            postUrl = 'https://www.linkedin.com/feed/update/' + urn;
                        }

                        idx++;
                        if (authorNameEl) {
                            results.push({
                                post_id: 'post_' + String(idx).padStart(3, '0'),
                                author_name: (authorNameEl.innerText || '').trim(),
                                author_headline: headlineEl ? headlineEl.innerText.trim() : '',
                                author_linkedin_url: profileUrl,
                                post_content: contentEl ? contentEl.innerText.trim().substring(0, 500) : '',
                                post_url: postUrl,
                                likes: likesEl ? parseInt(likesEl.innerText.replace(/,/g,'')) || 0 : 0,
                                comments: commentsEl ? parseInt(commentsEl.innerText.replace(/,/g,'')) || 0 : 0,
                                reposts: 0,
                                posted_ago: timeEl ? timeEl.innerText.trim() : '',
                                hashtags: [],
                            });
                        }
                    } catch(e) {}
                });
                return results;
            }""")

            hashtag_pattern = re.compile(r"#\w+")
            for post in posts:
                content = post.get("post_content", "")
                post["hashtags"] = hashtag_pattern.findall(content)

            posts = posts[:count]

            return {
                "success": True,
                "posts": posts,
                "total_found": len(posts),
            }

        except Exception as e:
            logger.error(f"Search posts error: {e}")
            return {"success": False, "error": str(e), "posts": []}

    # ------------------------------------------------------ comment on post
    async def comment_on_post(self, post_url: str, comment_text: str) -> Dict[str, Any]:
        """Navigate to a post and leave a comment."""
        if not self.logged_in:
            return {"success": False, "error": "Not logged in"}

        try:
            if post_url:
                await self.page.goto(post_url, wait_until="domcontentloaded")
                await _human_delay(2, 3)

            comment_btn = await self.page.query_selector(
                'button:has-text("Comment"), '
                'button[aria-label*="Comment"]'
            )
            if comment_btn:
                await comment_btn.click()
                await _human_delay(1, 2)

            comment_box = await self.page.query_selector(
                'div.comments-comment-box__form div[contenteditable="true"], '
                'div.ql-editor[contenteditable="true"], '
                'div[role="textbox"][contenteditable="true"]'
            )

            if not comment_box:
                await _human_delay(1, 2)
                comment_box = await self.page.query_selector(
                    'div[contenteditable="true"][data-placeholder]'
                )

            if not comment_box:
                return {"success": False, "error": "Could not find comment box"}

            await comment_box.click()
            await _human_delay(0.3, 0.5)
            await comment_box.fill(comment_text)
            await _human_delay(0.5, 1)

            post_btn = await self.page.query_selector(
                'button.comments-comment-box__submit-button, '
                'button:has-text("Post")'
            )

            if not post_btn:
                return {"success": False, "error": "Could not find Post button for comment"}

            await post_btn.click()
            await _human_delay(1, 2)

            return {"success": True}

        except Exception as e:
            logger.error(f"Comment on post error: {e}")
            return {"success": False, "error": str(e)}

    # ---------------------------------------- bulk: message people from search
    async def find_and_message_people(
        self, query: str, message: str, count: int = 10
    ) -> Dict[str, Any]:
        """Search for people, then message each one."""
        search_result = await self.search_people(query, count)
        if not search_result["success"]:
            return search_result

        people = search_result["people"]
        results = []

        for person in people:
            url = person.get("linkedin_url", "")
            if not url:
                results.append({**person, "message_status": "skipped", "error": "No profile URL"})
                continue

            send_result = await self.send_message(url, message)
            await _human_delay(3, 6)

            results.append({
                **person,
                "message_status": "sent" if send_result["success"] else "failed",
                "method": send_result.get("method", ""),
                "error": send_result.get("error", ""),
            })

        sent = sum(1 for r in results if r["message_status"] == "sent")
        failed = sum(1 for r in results if r["message_status"] == "failed")
        skipped = sum(1 for r in results if r["message_status"] == "skipped")

        return {
            "success": True,
            "people": results,
            "total_found": len(people),
            "sent": sent,
            "failed": failed,
            "skipped": skipped,
        }

    # ---------------------------------------- bulk: search posts, comment & DM
    async def find_and_interact_with_posts(
        self, query: str, message_to_author: str, reply_text: str, count: int = 10
    ) -> Dict[str, Any]:
        """Search for posts, comment on each, then message each author."""
        search_result = await self.search_posts(query, count)
        if not search_result["success"]:
            return search_result

        posts = search_result["posts"]
        results = []

        for post in posts:
            post_url = post.get("post_url", "")
            author_url = post.get("author_linkedin_url", "")

            comment_result = {"success": False, "error": "No post URL"}
            if post_url:
                comment_result = await self.comment_on_post(post_url, reply_text)
                await _human_delay(2, 4)

            message_result = {"success": False, "error": "No author URL"}
            if author_url:
                message_result = await self.send_message(author_url, message_to_author)
                await _human_delay(3, 6)

            results.append({
                **post,
                "reply_status": "sent" if comment_result["success"] else "failed",
                "reply_error": comment_result.get("error", ""),
                "message_status": "sent" if message_result["success"] else "failed",
                "message_error": message_result.get("error", ""),
            })

        replies_sent = sum(1 for r in results if r["reply_status"] == "sent")
        messages_sent = sum(1 for r in results if r["message_status"] == "sent")

        return {
            "success": True,
            "posts": results,
            "total_found": len(posts),
            "replies_sent": replies_sent,
            "messages_sent": messages_sent,
            "replies_failed": len(results) - replies_sent,
            "messages_failed": len(results) - messages_sent,
        }
