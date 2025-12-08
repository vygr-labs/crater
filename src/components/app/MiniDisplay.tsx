import { Box } from "styled-system/jsx";
import { useAppContext } from "~/layouts/AppContext";
import { Match, Show, Switch, createEffect, createMemo } from "solid-js";
import RenderTheme from "./editor/RenderTheme";
import { RenderEditorContainer } from "./editor/ui/Container";
import { RenderEditorText } from "./editor/ui/Text";
import { parseThemeData } from "~/utils";
import Image from "./Image";
import Video from "./Video";
import { css } from "styled-system/css";
import type { DisplayInfo, DisplayProps, Theme } from "~/types";
import { Text } from "../ui/text";
import { TbBrandAbstract } from "solid-icons/tb";
import { DisplayContext } from "~/layouts/DisplayContext";
import { createStore } from "solid-js/store";
import type { AppDisplayData } from "~/types/app-context";
import { defaultDisplayData } from "~/utils/constants";

const miniThemeRenderMap = {
	EditorContainer: RenderEditorContainer,
	EditorText: RenderEditorText,
};

interface MiniDisplayProps {
	/**
	 * "preview" - Shows preview item content
	 * "live" - Shows actual live output (respects hideLive, showLogo, etc.)
	 */
	mode: "preview" | "live";
	/**
	 * The display data to show (for preview mode, this is the preview item)
	 */
	displayItem?: DisplayProps;
	/**
	 * The index of the item to display (defaults to 0 for preview, or current focused index)
	 */
	displayIndex?: number;
}

/**
 * A mini display component that shows a scaled-down version of the projection output.
 * - In "preview" mode: Shows the preview item content with appropriate theme
 * - In "live" mode: Shows exactly what's on the projection (including logo, clear state)
 */
export default function MiniDisplay(props: MiniDisplayProps) {
	const { appStore } = useAppContext();

	// Create a local display store for preview mode
	// This allows the theme to render with preview content instead of live content
	const [localDisplayStore, setLocalDisplayStore] = createStore<AppDisplayData>({
		...defaultDisplayData,
		scriptureTheme: appStore.displayData.scriptureTheme,
		songTheme: appStore.displayData.songTheme,
		presentationTheme: appStore.displayData.presentationTheme,
	});

	// Get the content to display based on mode
	const displayContent = createMemo((): DisplayInfo | undefined => {
		if (props.mode === "live") {
			// Live mode: show actual displayData.displayContent
			return appStore.displayData.displayContent;
		}
		// Preview mode: compute from preview item
		const item = props.displayItem;
		const index = props.displayIndex ?? 0;
		if (!item || !item.data || !item.data[index]) return undefined;
		return {
			type: item.type,
			[item.type]: item.data[index],
		} as DisplayInfo;
	});

	// Update local display store when display content changes (for preview mode)
	createEffect(() => {
		const content = displayContent();
		setLocalDisplayStore("displayContent", content);
		// Also sync themes
		setLocalDisplayStore("scriptureTheme", appStore.displayData.scriptureTheme);
		setLocalDisplayStore("songTheme", appStore.displayData.songTheme);
	});

	const contentType = createMemo(() => displayContent()?.type);

	// Get the appropriate theme based on content type
	const theme = createMemo((): Theme | undefined => {
		const type = contentType();
		if (type === "scripture") return appStore.displayData.scriptureTheme;
		if (type === "song") return appStore.displayData.songTheme;
		return undefined;
	});

	// Check if we should show the "cleared" state (live mode only)
	const isCleared = createMemo(() => {
		return props.mode === "live" && appStore.hideLive;
	});

	// Check if we should show the logo (live mode only)
	const showLogo = createMemo(() => {
		return props.mode === "live" && appStore.showLogo;
	});

	// Check if there's any content to show
	const hasContent = createMemo(() => {
		if (props.mode === "live") {
			return !!appStore.displayData.displayContent;
		}
		return !!props.displayItem && props.displayItem.data?.length > 0;
	});

	// Wrapper component that provides local display context for preview mode
	const ThemeWrapper = (wrapperProps: { children: any }) => {
		if (props.mode === "preview") {
			return (
				<DisplayContext.Provider value={{ displayStore: localDisplayStore, setDisplayStore: setLocalDisplayStore }}>
					{wrapperProps.children}
				</DisplayContext.Provider>
			);
		}
		return wrapperProps.children;
	};

	return (
		<Box
			w="full"
			aspectRatio="16/9"
			bg="black"
			borderRadius="md"
			overflow="hidden"
			position="relative"
			border="1px solid"
			borderColor="gray.700"
			classList={{
				"clear-display": isCleared(),
			}}
		>
			{/* Logo background - always rendered but visibility controlled */}
			<Show when={appStore.logoBg}>
				<Image
					src={appStore.logoBg}
					alt="Logo Background"
					class={css({
						objectFit: "contain",
						position: "absolute",
						inset: 0,
						w: "full",
						h: "full",
						zIndex: 5,
					})}
					style={{
						opacity: showLogo() ? 1 : 0,
						visibility: showLogo() ? "visible" : "hidden",
					}}
				/>
			</Show>

			{/* Main content */}
			<Box
				pos="absolute"
				inset={0}
				style={{
					opacity: showLogo() ? 0 : 1,
					visibility: showLogo() ? "hidden" : "visible",
				}}
			>
				<Show
					when={hasContent()}
					fallback={
						<Box
							w="full"
							h="full"
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							<Text fontSize="10px" color="gray.600">
								{props.mode === "live" ? "Nothing live" : "No preview"}
							</Text>
						</Box>
					}
				>
					<ThemeWrapper>
						<Switch>
							{/* Scripture content */}
							<Match when={contentType() === "scripture"}>
								<Show
									when={theme()}
									fallback={
										<Box
											w="full"
											h="full"
											display="flex"
											alignItems="center"
											justifyContent="center"
										>
											<Text fontSize="8px" color="gray.500" textAlign="center">
												No theme
											</Text>
										</Box>
									}
								>
									<RenderTheme
										data={parseThemeData(theme()?.theme_data)}
										renderMap={miniThemeRenderMap}
										extraProps={{
											isProjectionDisplay: true,
											displayContent: displayContent(),
										}}
									/>
								</Show>
							</Match>

							{/* Song content */}
							<Match when={contentType() === "song"}>
								<Show
									when={theme()}
									fallback={
										<Box
										w="full"
										h="full"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										<Text fontSize="8px" color="gray.500" textAlign="center">
											No theme
										</Text>
									</Box>
								}
							>
								<RenderTheme
									data={parseThemeData(theme()?.theme_data)}
									renderMap={miniThemeRenderMap}
									extraProps={{
										isProjectionDisplay: true,
										displayContent: displayContent(),
									}}
								/>
							</Show>
						</Match>

						{/* Image content */}
						<Match when={contentType() === "image"}>
							<Image
								src={displayContent()?.image?.path}
								alt={displayContent()?.image?.title || "Image"}
								class={css({
									w: "full",
									h: "full",
									objectFit: "contain",
								})}
							/>
						</Match>

						{/* Video content - just show a thumbnail/poster */}
						<Match when={contentType() === "video"}>
							<Box
								w="full"
								h="full"
								display="flex"
								alignItems="center"
								justifyContent="center"
								bg="gray.900"
							>
								<Video
									src={displayContent()?.video?.path}
									about={displayContent()?.video?.title || "Video"}
									controls={false}
									preload="metadata"
									muted
								/>
							</Box>
						</Match>

						{/* Strong's content */}
						<Match when={contentType() === "strongs"}>
							<Box
								w="full"
								h="full"
								p={1}
								display="flex"
								flexDir="column"
								gap={0.5}
								overflow="hidden"
							>
								<Text
									fontSize="8px"
									fontWeight="bold"
									color="blue.400"
									truncate
								>
									{displayContent()?.strongs?.word} - {displayContent()?.strongs?.label}
								</Text>
								<Text
									fontSize="6px"
									color="gray.300"
									lineClamp={3}
									innerHTML={displayContent()?.strongs?.content}
								/>
							</Box>
						</Match>
					</Switch>
					</ThemeWrapper>
				</Show>
			</Box>

			{/* Live mode indicator badge */}
			<Show when={props.mode === "live" && showLogo()}>
				<Box
					pos="absolute"
					bottom={1}
					right={1}
					bg="black/70"
					px={1}
					py={0.5}
					borderRadius="sm"
					display="flex"
					alignItems="center"
					gap={0.5}
					zIndex={15}
					class="preserve-color"
				>
					<TbBrandAbstract size={10} color="var(--colors-green-400)" />
					<Text fontSize="8px" color="green.400">
						Logo
					</Text>
				</Box>
			</Show>
		</Box>
	);
}
