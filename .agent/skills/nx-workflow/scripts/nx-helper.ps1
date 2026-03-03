# Nx Helper Script for Market Scanner
# Usage: .\nx-helper.ps1 <command>

param (
    [Parameter(Mandatory=$true)]
    [string]$Command
)

switch ($Command) {
    "serve-all" {
        Write-Host "Starting both API and Web..." -ForegroundColor Green
        npx nx run-many --target=serve --all
    }
    "build-all" {
        Write-Host "Building all projects..." -ForegroundColor Cyan
        npx nx run-many --target=build --all
    }
    "test-all" {
        Write-Host "Running tests..." -ForegroundColor Yellow
        npx nx run-many --target=test --all
    }
    "lint-all" {
        Write-Host "Linting codebase..." -ForegroundColor Magenta
        npx nx run-many --target=lint --all
    }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host "Available commands: serve-all, build-all, test-all, lint-all"
    }
}
