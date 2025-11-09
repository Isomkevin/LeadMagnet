"""
Email Sender Service
Supports multiple sending methods:
1. SendGrid (Recommended - allows custom sender emails)
2. Yagmail with Reply-To (Fallback method)
"""

import os
import yagmail
from typing import List, Union
from dotenv import load_dotenv

load_dotenv()


class SendGridEmailSender:
    """SendGrid email sender - allows sending from any verified email"""
    def __init__(self):
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail, Email, To, Content
            self.SendGridAPIClient = SendGridAPIClient
            self.Mail = Mail
            self.Email = Email
            self.To = To
            self.Content = Content
        except ImportError:
            raise ImportError("SendGrid not installed. Run: pip install sendgrid")
        
        self.api_key = os.getenv('SENDGRID_API_KEY', '')
        if not self.api_key:
            raise ValueError("Please set SENDGRID_API_KEY in .env file")
        
        self.client = SendGridAPIClient(self.api_key)
    
    def send_email(
        self,
        from_email: str,
        to_email: Union[str, List[str]],
        subject: str,
        contents: str,
        attachments: List[str] = None,
        cc_email: str = None
    ) -> bool:
        """Send email via SendGrid from any verified email"""
        try:
            from sendgrid.helpers.mail import Cc
            
            message = self.Mail(
                from_email=self.Email(from_email),
                to_emails=self.To(to_email),
                subject=subject,
                html_content=self.Content("text/html", contents)
            )
            
            # Add CC if provided
            if cc_email:
                message.add_cc(Cc(cc_email))
                print(f"📧 CC: {cc_email}")
            
            response = self.client.send(message)
            print(f"✅ SendGrid: Email sent to {to_email} from {from_email}")
            return True
        except Exception as e:
            print(f"❌ SendGrid failed: {str(e)}")
            return False


class YagmailEmailSender:
    """Yagmail sender with Reply-To header (user email appears in replies)"""
    def __init__(self):
        self.email_user = os.getenv('EMAIL_USER', '')
        self.email_password = os.getenv('EMAIL_PASSWORD', '')
        
        if not self.email_user or not self.email_password:
            raise ValueError("Please set EMAIL_USER and EMAIL_PASSWORD in .env file")
        
        self.yag = yagmail.SMTP(self.email_user, self.email_password)
    
    def send_email(
        self,
        from_email: str,
        to_email: Union[str, List[str]],
        subject: str,
        contents: str,
        attachments: List[str] = None,
        cc_email: str = None
    ) -> bool:
        """
        Send email with Reply-To header and CC support.
        
        IMPORTANT: Email is SENT FROM the configured EMAIL_USER account,
        but replies will go to the user's email (from_email).
        
        The recipient will see:
        - From: EMAIL_USER
        - Reply-To: from_email
        - CC: cc_email (if provided)
        - Clean email content without any banners
        """
        try:
            # Set Reply-To header
            headers = {
                'Reply-To': from_email,
            }
            
            # Send clean email without banners
            # Prepare CC list
            cc_list = None
            if cc_email:
                cc_list = [cc_email] if isinstance(cc_email, str) else cc_email
                print(f"📧 CC: {cc_email}")
            
            self.yag.send(
                to=to_email,
                subject=subject,
                contents=contents,  # Clean content without banners
                attachments=attachments,
                headers=headers,
                cc=cc_list
            )
            
            print(f"✅ Yagmail: Email sent to {to_email} (on behalf of {from_email})")
            if cc_email:
                print(f"   CC sent to: {cc_email}")
            print(f"   Note: Replies will go to {from_email}")
            return True
        except Exception as e:
            print(f"❌ Yagmail failed: {str(e)}")
            return False


class EmailSender:
    """
    Smart email sender that tries multiple methods:
    1. SendGrid (if API key provided) - RECOMMENDED for production
    2. Yagmail with Reply-To (if Gmail credentials provided) - Good for testing
    """
    def __init__(self):
        self.sender = None
        self.method = None
        
        # Try SendGrid first (production method)
        try:
            self.sender = SendGridEmailSender()
            self.method = "sendgrid"
            print("✅ Email Service: SendGrid (sends from user's actual email)")
        except (ImportError, ValueError) as e:
            # Fall back to Yagmail
            try:
                self.sender = YagmailEmailSender()
                self.method = "yagmail"
                print("✅ Email Service: Yagmail (uses Reply-To header)")
                print("   💡 Tip: For production, use SendGrid to send from actual user emails")
            except ValueError:
                raise ValueError(
                    "❌ No email service configured!\n\n"
                    "Choose one option:\n\n"
                    "OPTION 1 (Recommended for Production):\n"
                    "  - Get SendGrid API key: https://sendgrid.com\n"
                    "  - Add to .env: SENDGRID_API_KEY=your_key\n"
                    "  - Verify sender emails in SendGrid dashboard\n"
                    "  - pip install sendgrid\n\n"
                    "OPTION 2 (Good for Testing):\n"
                    "  - Add to .env: EMAIL_USER=your@gmail.com\n"
                    "  - Add to .env: EMAIL_PASSWORD=app_password\n"
                    "  - Note: Emails will be sent 'on behalf of' user\n"
                )
    
    def send_email(
        self,
        from_email: str,
        to_email: Union[str, List[str]],
        subject: str,
        contents: str,
        attachments: List[str] = None,
        cc_email: str = None
    ) -> dict:
        """
        Send email using configured method.
        
        Args:
            from_email: User's email address (actual sender or Reply-To)
            to_email: Recipient email address
            subject: Email subject
            contents: Email body (HTML supported)
            attachments: Optional file paths
            cc_email: Optional CC email address (user gets a copy)
            
        Returns:
            dict: {success: bool, method: str, message: str}
        """
        try:
            success = self.sender.send_email(
                from_email=from_email,
                to_email=to_email,
                subject=subject,
                contents=contents,
                attachments=attachments,
                cc_email=cc_email
            )
            
            message = f"Email sent successfully via {self.method}"
            if cc_email:
                message += f" (copy sent to {cc_email})"
            
            return {
                "success": success,
                "method": self.method,
                "message": message,
                "from": from_email,
                "to": to_email,
                "cc": cc_email
            }
        except Exception as e:
            return {
                "success": False,
                "method": self.method,
                "message": f"Failed to send email: {str(e)}",
                "from": from_email,
                "to": to_email,
                "cc": cc_email
            }


# Singleton instance
_email_sender = None

def get_email_sender():
    """Get or create email sender singleton"""
    global _email_sender
    if _email_sender is None:
        _email_sender = EmailSender()
    return _email_sender
