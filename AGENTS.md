# The ALANA Project - Website

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is always running on `$PORT` (default 8443). Source changes
are reflected through hot reload.

## Key Files

- `src/main.tsx` - Browser entry point
- `vite.figma.config.ts` - Figma Make wrapper configuration
- `.mise.toml` - Toolchain versions

## Project Guidelines

Read and always follow the instructions in the [project guidelines](guidelines/Guidelines.md) unless the user requests otherwise.

## Architecture

- This repository contains the public ALANA website. The Contribution Calculator is a separate external product; do not reintroduce its former pages, datasets, or submission stack here.
- Read [SECURITY.md](SECURITY.md) before changing Supabase access, Guardian authorization, wallet gating, or administrative writes.
- Keep static fallbacks only where a live public content source needs graceful degradation.
