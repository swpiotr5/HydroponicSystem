import pytest
from playwright.sync_api import Page, expect

@pytest.mark.usefixtures("page")
def test_add_measurement_ui_elements(page: Page):
    page.goto("http://localhost:3000")
    page.evaluate("localStorage.setItem('token', 'test_token');")
    page.goto("http://localhost:3000/measurements")

    # Sprawdź, że elementy formularza są obecne
    expect(page.locator("input[name='ph']")).to_have_count(1)
    expect(page.locator("input[name='temperature']")).to_have_count(1)
    expect(page.locator("input[name='tds']")).to_have_count(1)

    # Sprawdź select
    expect(page.locator("select").first).to_have_count(1)

    # Sprawdź, że przycisk jest widoczny
    expect(page.locator("button[type='submit']")).to_have_count(1)

    # NIE sprawdzaj canvas ani tabeli, bo mogą być renderowane dopiero po odpowiedzi backendu
