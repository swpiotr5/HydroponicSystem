import pytest
from playwright.sync_api import Page, expect

@pytest.mark.usefixtures("page")
def test_add_measurement_and_chart_update(page: Page):
    page.goto("http://localhost:3000")
    page.evaluate("""
        localStorage.setItem("token", "testowy_token_123");
    """)

    page.goto("http://localhost:3000/measurements")

    page.wait_for_selector("select")

    page.select_option("select", label=None)  # Wybierz pierwszy system
    page.fill("input[name='ph']", "6.5")
    page.fill("input[name='temperature']", "22")
    page.fill("input[name='tds']", "500")

    page.click("button[type='submit']")
    page.wait_for_selector("canvas")

    assert not page.locator(".alert-danger").is_visible(), "Błąd przy dodawaniu pomiaru"

    chart = page.locator("canvas")
    expect(chart).to_be_visible()

    rows = page.locator("table tbody tr")
    expect(rows).to_have_count_greater_than(0)
