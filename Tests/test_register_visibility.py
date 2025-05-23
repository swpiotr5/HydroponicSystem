import pytest
from playwright.sync_api import Page

def test_register_component(page: Page):
    page.goto("http://localhost:3000/register")

    assert page.locator("form").is_visible()

    toggle_button = page.locator("button:has-text('🌙 Tryb nocny')")
    assert toggle_button.is_visible()
    toggle_button.click()

    assert page.locator("button:has-text('☀️ Tryb dzienny')").is_visible()
