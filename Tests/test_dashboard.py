import pytest
from playwright.sync_api import Page

def test_dashboard_component(page: Page):
    page.goto("http://localhost:3000/dashboard")

    assert page.locator("div.dashboard-container").is_visible()

    systems = page.locator("div.system-item")
    assert systems.count() > 0
