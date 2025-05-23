import pytest
from playwright.sync_api import Page


def test_dashboard_component(page):
    page.goto("http://localhost:3000/dashboard")

    assert page.locator("h1", has_text="Dashboard").is_visible()

    assert page.locator(".chart-container").first.is_visible()
