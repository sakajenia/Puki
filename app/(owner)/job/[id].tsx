import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import { BigButton } from "@/components/BigButton";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/lib/supabase";
import { colors, radius, spacing } from "@/lib/theme";
import { getSignedVideoUrl } from "@/lib/upload";
import type { JobArea, JobStatus, JobWithProperty } from "@/lib/types";

export default function OwnerJobReview() {
  const { id: jobId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [job, setJob] = useState<JobWithProperty | null>(null);
  const [areas, setAreas] = useState<JobArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [playLoading, setPlayLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [{ data: jobData }, { data: areaData }] = await Promise.all([
      supabase
        .from("jobs")
        .select("*, property:properties(id, name, address)")
        .eq("id", jobId)
        .single(),
      supabase
        .from("job_areas")
        .select("*")
        .eq("job_id", jobId)
        .order("position", { ascending: true }),
    ]);
    setJob((jobData as JobWithProperty) ?? null);
    setAreas((areaData as JobArea[]) ?? []);
    setLoading(false);
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  const play = useCallback(async (path: string) => {
    setPlayLoading(true);
    const url = await getSignedVideoUrl(path);
    setPlayLoading(false);
    if (url) setPlayUrl(url);
  }, []);

  const setStatus = useCallback(
    async (status: JobStatus) => {
      setBusy(true);
      const { error } = await supabase
        .from("jobs")
        .update({ status })
        .eq("id", jobId);
      if (!error) setJob((j) => (j ? { ...j, status } : j));
      setBusy(false);
    },
    [jobId]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const doneCount = areas.filter((a) => a.status === "done").length;
  const canDecide = job?.status === "submitted";

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 120 }]}
      >
        <Text style={styles.title}>{job?.property?.name ?? "Cleaning job"}</Text>
        {job?.property?.address ? (
          <Text style={styles.addr}>{job.property.address}</Text>
        ) : null}
        <View style={styles.statusRow}>
          {job ? <StatusBadge status={job.status} /> : null}
          <Text style={styles.progress}>
            {doneCount}/{areas.length} areas filmed
          </Text>
        </View>

        <View style={styles.list}>
          {areas.map((a) => {
            const done = a.status === "done" && a.video_path;
            return (
              <Pressable
                key={a.id}
                disabled={!done}
                onPress={() => done && play(a.video_path!)}
                style={({ pressed }) => [
                  styles.areaRow,
                  pressed && done && styles.pressed,
                ]}
              >
                <View style={styles.areaLeft}>
                  <Text style={styles.areaIcon}>{done ? "▶️" : "⏳"}</Text>
                  <Text style={styles.areaName}>{a.area_name}</Text>
                </View>
                <Text style={done ? styles.watch : styles.pending}>
                  {done ? "Watch" : "Not yet"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {canDecide ? (
        <View style={[styles.decideBar, { paddingBottom: insets.bottom + spacing.md }]}>
          <BigButton
            label="Ask to redo"
            variant="danger"
            onPress={() => setStatus("redo")}
            loading={busy}
            style={styles.flexBtn}
          />
          <BigButton
            label="Approve"
            variant="success"
            onPress={() => setStatus("approved")}
            loading={busy}
            style={styles.flexBtn}
          />
        </View>
      ) : null}

      {playLoading ? (
        <View style={styles.playOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : null}

      <Modal
        visible={!!playUrl}
        animationType="slide"
        onRequestClose={() => setPlayUrl(null)}
      >
        {playUrl ? (
          <PlayerModal url={playUrl} onClose={() => setPlayUrl(null)} insetTop={insets.top} />
        ) : null}
      </Modal>
    </View>
  );
}

function PlayerModal({
  url,
  onClose,
  insetTop,
}: {
  url: string;
  onClose: () => void;
  insetTop: number;
}) {
  const player = useVideoPlayer(url, (p) => {
    p.play();
  });
  return (
    <View style={styles.modalWrap}>
      <VideoView style={StyleSheet.absoluteFill} player={player} contentFit="contain" />
      <Pressable
        onPress={onClose}
        style={[styles.modalClose, { top: insetTop + spacing.sm }]}
        hitSlop={10}
      >
        <Text style={styles.modalCloseText}>✕ Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  container: { padding: spacing.lg },
  title: { fontSize: 26, fontWeight: "800", color: colors.text },
  addr: { fontSize: 15, color: colors.textMuted, marginTop: 2 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  progress: { fontSize: 15, color: colors.textMuted, fontWeight: "600" },
  list: { marginTop: spacing.lg, gap: spacing.sm },
  areaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: { opacity: 0.7 },
  areaLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  areaIcon: { fontSize: 20 },
  areaName: { fontSize: 17, color: colors.text, fontWeight: "600" },
  watch: { color: colors.primary, fontWeight: "700", fontSize: 16 },
  pending: { color: colors.textMuted, fontSize: 15 },
  decideBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  flexBtn: { flex: 1 },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay,
  },
  modalWrap: { flex: 1, backgroundColor: "#000" },
  modalClose: {
    position: "absolute",
    right: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalCloseText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
