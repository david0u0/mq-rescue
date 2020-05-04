import { SiteInfo } from "./site_info";

export type Config = {
    file_url: string | undefined,
    sites: SiteInfo[];
}