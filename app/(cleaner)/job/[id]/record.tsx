import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { BigButton } from "@/components/BigButton";
import { ClipPreview } from "@/components/ClipPreview";
import { ProgressDots } from "@/components/ProgressDots";
import { MAX_CLIP_SECONDS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { colors, radius, spacing } from "@/lib/theme";
import { uploadAreaVideo } from "@/lib/upload";
import type { JobArea } from "@/lib/types";

type Phase =
  | "loading"
  | "intro" // show the area name + big Record button
  | "camera" // camera is open, recording or ready
  | "preview" // play back the clip, keep or redo
  | "saving" // uploading + writing to db
  | "saved" // green check, about to advance
  | "finished"; // all areas done, submit screen

export default function RecordFlow() {
  const { id: jobId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [camPerm, requestCam] = useCameraPermissions();
  const [micPerm, requestMic] = useMicrophonePermissions();
  const cameraRef = useRef<CameraView>(null);

  const [areas, setAreas] = useState<JobArea[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load areas, then jump to the first one that still needs a video.
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("job_areas")
        .select("*")
        .eq("job_id", jobId)
        .order("position", { ascending: true });
      if (error) {
        setError(error.message);
        return;
      }
      const list = (data as JobArea[]) ?? [];
      setAreas(list);
      const firstPending = list.findIndex((a) => a.status !== "done");
      if (firstPending === -1) {
        setPhase("finished");
      } else {
        setIndex(firstPending);
        setPhase("intro");
        // Mark the job as in progress (ignore errors — not critical).
        supabase
          .from("jobs")
          .update({ status: "in_progress" })
          .eq("id", jobId)
          .then(() => {});
      }
    })();
  }, [jobId]);

  // Recording timer.
  useEffect(() => {
    if (!isRecording) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [isRecording]);

  const area = areas[index];
  const doneCount = areas.filter((a) => a.status === "done").length;

  const openCamera = useCallback(async () => {
    if (!camPerm?.granted) {
      const r = await requestCam();
      if (!r.granted) return setError("Camera permission is needed to record.");
    }
    if (!micPerm?.granted) {
      await requestMic(); // audio is nice-to-have; continue even if denied
    }
    setError(null);
    setPhase("camera");
  }, [camPerm, micPerm, requestCam, requestMic]);

  const startRecording = useCallback(async () => {
    if (!cameraRef.current || isRecording) return;
    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: MAX_CLIP_SECONDS,
      });
      // Resolves when stopped or maxDuration is hit.
      setIsRecording(false);
      if (video?.uri) {
        setRecordedUri(video.uri);
        setPhase("preview");
      } else {
        setPhase("intro");
      }
    } catch (e) {
      setIsRecording(false);
      setError(e instanceof Error ? e.message : "Recording failed.");
      setPhase("intro");
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    cameraRef.current?.stopRecording();
  }, []);

  const redo = useCallback(() => {
    setRecordedUri(null);
    setPhase("camera");
  }, []);

  const keepClip = useCallback(async () => {
    if (!area || !recordedUri) return;
    setPhase("saving");
    setError(null);
    try {
      const path = await uploadAreaVideo(jobId, area.id, recordedUri);
      const { error } = await supabase
        .from("job_areas")
        .update({ video_path: path, status: "done" })
        .eq("id", area.id);
      if (error) throw error;

      // Reflect locally and advance.
      const updated = areas.map((a) =>
        a.id === area.id ? { ...a, video_path: path, status: "done" as const } : a
      );
      setAreas(updated);
      setRecordedUri(null);
      setPhase("saved");

      setTimeout(() => {
        const next = updated.findIndex((a) => a.status !== "done");
        if (next === -1) {
          setPhase("finished");
        } else {
          setIndex(next);
          setPhase("intro");
        }
      }, 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Try again.");
      setPhase("preview");
    }
  }, [area, recordedUri, areas, jobId]);

  const submitJob = useCallback(async () => {
    setPhase("saving");
    const { error } = await supabase
      .from("jobs")
      .update({ status: "submitted" })
      .eq("id", jobId);
    if (error) {
      setError(error.message);
      setPhase("finished");
      return;
    }
    router.replace("/(cleaner)");
  }, [jobId, router]);

  // ---- Render per phase ----------------------------------------------------

  if (phase === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (phase === "camera") {
    return (
      <View style={styles.cameraWrap}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          mode="video"
          videoQuality="480p"
        />
        <View style={[styles.cameraTop, { paddingTop: insets.top + spacing.sm }]}>
          <Text style={styles.cameraArea}>{area?.area_name}</Text>
          {isRecording ? (
            <View style={styles.recPill}>
              <View style={styles.recDot} />
              <Text style={styles.recText}>
                {elapsed}s / {MAX_CLIP_SECONDS}s
              </Text>
            </View>
          ) : (
            <Text style={styles.cameraHint}>
              Point at the area, then press the button
            </Text>
          )}
        </View>

        <View style={[styles.shutterRow, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Pressable
            onPress={isRecording ? stopRecording : startRecording}
            style={[styles.shutter, isRecording && styles.shutterRecording]}
          >
            <View
              style={isRecording ? styles.shutterSquare : styles.shutterCircle}
            />
          </Pressable>
          <Text style={styles.shutterLabel}>
            {isRecording ? "Tap to stop" : "Tap to record"}
          </Text>
        </View>
      </View>
    );
  }

  if (phase === "preview" && recordedUri) {
    return (
      <View style={[styles.previewWrap, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.previewTitle}>How does it look?</Text>
        <Text style={styles.previewArea}>{area?.area_name}</Text>
        <View style={styles.previewVideo}>
          <ClipPreview key={recordedUri} uri={recordedUri} />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={[styles.previewActions, { paddingBottom: insets.bottom + spacing.md }]}>
          <BigButton
            label="↺ Redo"
            variant="neutral"
            onPress={redo}
            style={styles.flexBtn}
          />
          <BigButton
            label="✓ Looks good"
            variant="success"
            onPress={keepClip}
            style={styles.flexBtn}
          />
        </View>
      </View>
    );
  }

  if (phase === "saving") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.savingText}>Saving…</Text>
      </View>
    );
  }

  if (phase === "saved") {
    return (
      <View style={styles.center}>
        <Text style={styles.bigCheck}>✅</Text>
        <Text style={styles.savedText}>Saved!</Text>
      </View>
    );
  }

  if (phase === "finished") {
    return (
      <View style={[styles.center, { padding: spacing.lg }]}>
        <Text style={styles.bigCheck}>🎉</Text>
        <Text style={styles.finTitle}>All areas recorded!</Text>
        <Text style={styles.finSub}>
          You filmed all {areas.length} areas. Send it to your manager to review.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.finActions}>
          <BigButton label="Send for review" variant="success" onPress={submitJob} />
          <BigButton
            label="Back"
            variant="neutral"
            onPress={() => router.replace("/(cleaner)")}
          />
        </View>
      </View>
    );
  }

  // phase === "intro"
  return (
    <View style={[styles.introWrap, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.introTop}>
        <Pressable onPress={() => router.replace("/(cleaner)")} hitSlop={10}>
          <Text style={styles.close}>✕ Close</Text>
        </Pressable>
        <ProgressDots total={areas.length} current={index} doneCount={doneCount} />
      </View>

      <View style={styles.introBody}>
        <Text style={styles.stepLabel}>
          Step {index + 1} of {areas.length}
        </Text>
        <Text style={styles.areaName}>{area?.area_name}</Text>
        <Text style={styles.instruction}>
          Slowly film this whole area so your manager can see it is clean.
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={[styles.introActions, { paddingBottom: insets.bottom + spacing.lg }]}>
        <BigButton label="🎥 Record this area" onPress={openCamera} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  savingText: { marginTop: spacing.md, fontSize: 18, color: colors.textMuted },
  bigCheck: { fontSize: 90 },
  savedText: { fontSize: 28, fontWeight: "800", color: colors.success },

  // Intro
  introWrap: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  introTop: { gap: spacing.lg },
  close: { color: colors.textMuted, fontSize: 16, fontWeight: "600" },
  introBody: { flex: 1, justifyContent: "center", alignItems: "center" },
  stepLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  areaName: {
    fontSize: 46,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },
  instruction: {
    fontSize: 18,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  introActions: { gap: spacing.md },

  // Camera
  cameraWrap: { flex: 1, backgroundColor: "#000" },
  cameraTop: {
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  cameraArea: { color: "#fff", fontSize: 26, fontWeight: "800" },
  cameraHint: { color: "rgba(255,255,255,0.85)", fontSize: 15 },
  recPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  recDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.recording,
  },
  recText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  shutterRow: { marginTop: "auto", alignItems: "center", gap: spacing.sm },
  shutter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterRecording: { borderColor: colors.recording },
  shutterCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.recording,
  },
  shutterSquare: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.recording,
  },
  shutterLabel: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Preview
  previewWrap: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  previewTitle: { fontSize: 26, fontWeight: "800", color: colors.text },
  previewArea: { fontSize: 17, color: colors.textMuted, marginBottom: spacing.md },
  previewVideo: { flex: 1, marginBottom: spacing.md },
  previewActions: { flexDirection: "row", gap: spacing.md },
  flexBtn: { flex: 1 },

  // Finished
  finTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.text,
    marginTop: spacing.md,
    textAlign: "center",
  },
  finSub: {
    fontSize: 17,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  finActions: { alignSelf: "stretch", gap: spacing.md, marginTop: spacing.xl },

  error: { color: colors.danger, fontSize: 15, textAlign: "center", marginVertical: spacing.sm },
});
