"use client";

import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import {
  SearchPanel,
  SearchToolbar,
  ToolbarSelect,
} from "@/components/dashboard/SearchToolbar";
import {
  DashboardAlert,
  LoadingBlock,
  PageStack,
} from "@/components/dashboard/ui";
import { DOMAIN_SCOPES, RESEARCH_LOCATIONS } from "@/lib/dashboard/locations";

export function OrganicSearchLayout({
  title,
  description,
  searchDescription,
  domain,
  setDomain,
  locationCode,
  setLocationCode,
  scope,
  setScope,
  loading,
  error,
  dataForSeoConfigured,
  projectLoading: _projectLoading,
  onAnalyze,
  showLocation = true,
  showScope = true,
  children,
}: {
  title: string;
  description: string;
  searchDescription: string;
  domain: string;
  setDomain: (value: string) => void;
  locationCode: number;
  setLocationCode: (value: number) => void;
  scope: string;
  setScope: (value: string) => void;
  loading: boolean;
  error: string;
  dataForSeoConfigured: boolean;
  projectLoading?: boolean;
  onAnalyze: () => void;
  showLocation?: boolean;
  showScope?: boolean;
  children: ReactNode;
}) {
  return (
    <DashboardShell title={title} description={description}>
      <PageStack>
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <SearchPanel title="Domain" description={searchDescription}>
          <SearchToolbar
            value={domain}
            onChange={setDomain}
            onSubmit={() => void onAnalyze()}
            placeholder="example.com"
            loading={loading}
            submitLabel="Analyze"
          >
            {showLocation ? (
              <ToolbarSelect
                label="Location"
                value={locationCode}
                onChange={(v) => setLocationCode(Number(v))}
                options={RESEARCH_LOCATIONS.map((l) => ({
                  value: l.code,
                  label: l.label,
                }))}
              />
            ) : null}
            {showScope ? (
              <ToolbarSelect
                label="Scope"
                value={scope}
                onChange={setScope}
                options={DOMAIN_SCOPES.map((s) => ({
                  value: s.value,
                  label: s.label,
                }))}
              />
            ) : null}
          </SearchToolbar>
        </SearchPanel>

        {loading ? <LoadingBlock label={`Loading ${title.toLowerCase()}...`} /> : null}

        {children}
      </PageStack>
    </DashboardShell>
  );
}
