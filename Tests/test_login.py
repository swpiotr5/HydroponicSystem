import pytest
from playwright.sync_api import Page

def test_login_ui_interactions(page: Page):
    page.goto("http://localhost:3000/login")

    assert page.locator("form").is_visible()

    page.locator("input[type='email']").fill("test@example.com")
    page.locator("input[type='password']").fill("securepassword123")

    assert page.locator("input[type='email']").input_value() == "test@example.com"
    assert page.locator("input[type='password']").input_value() == "securepassword123"


    toggle_button = page.locator("button:has-text('🌙 Tryb nocny')")
    assert toggle_button.is_visible()
    toggle_button.click()

    container = page.locator("div.container-fluid")
    assert "bg-dark" in container.get_attribute("class")
    assert "text-light" in container.get_attribute("class")

    page.locator("form button[type='submit']").click()
