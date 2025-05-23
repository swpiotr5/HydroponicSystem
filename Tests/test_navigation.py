import pytest
from playwright.sync_api import Page

@pytest.fixture(autouse=True)
def clear_localstorage_before_each(page: Page):
    page.context.clear_cookies()
    page.add_init_script("localStorage.clear()")

def test_navigation_hidden_on_login_register(page: Page):
    page.goto("http://localhost:3000/login")
    assert page.locator("nav").count() == 0

    page.goto("http://localhost:3000/register")
    assert page.locator("nav").count() == 0

def test_navigation_visible_when_authenticated(page: Page):
    page.add_init_script("localStorage.setItem('token', 'fake-token')")
    page.goto("http://localhost:3000/dashboard")

    nav = page.locator("nav")
    assert nav.is_visible()
    assert page.locator("text=🏠 Dashboard").is_visible()
    assert page.locator("text=📊 Pomiary").is_visible()
    assert page.locator("text=🚪 Wyloguj").is_visible()

def test_logout_functionality(page: Page):
    page.add_init_script("localStorage.setItem('token', 'fake-token')")
    page.goto("http://localhost:3000/dashboard")

    page.locator("text=🚪 Wyloguj").click()
    page.wait_for_url("**/login")
    assert page.evaluate("localStorage.getItem('token')") is None

def test_private_route_redirects_when_no_token(page: Page):
    page.goto("http://localhost:3000/dashboard")
    page.wait_for_url("**/login")
