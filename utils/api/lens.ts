import { FarcasterProfile, LensUserProfile } from "@/types";
import axios from "axios";

export const fetchLensProfileUsers = async (query: string) => {
  const res = await axios.post("https://api-v2.lens.dev", {
    query: `query SearchProfiles($request: ProfileSearchRequest!) {
  searchProfiles(request: $request) {
    items {
      id
      stats {
        followers
        following
      }
      metadata {
        displayName
        picture {
          ... on ImageSet {
            optimized {
              uri
            }
          }
        }
      }
    }
  }
}

`,
    variables: { request: { query } },
  });

  return res.data.data.searchProfiles.items as LensUserProfile[];
};

export const fetchFarcasterProfiles = async (username: string) => {
  const res = await axios.get(
    `https://api.neynar.com/v2/farcaster/user/search?api_key=NEYNAR_API_DOCS&viewer_fid=-1&q=${username}`,
  );

  return res.data.result.users as FarcasterProfile[];
};
