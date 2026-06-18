import { StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { radius } from "@/lib/theme";

/**
 * Plays back a just-recorded clip. Mounted with a `key` of the uri by the caller
 * so the player initializes fresh for each new recording.
 */
export function ClipPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = false;
    p.play();
  });

  return (
    <VideoView
      style={styles.video}
      player={player}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

const styles = StyleSheet.create({
  video: {
    flex: 1,
    width: "100%",
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "#000",
  },
});
