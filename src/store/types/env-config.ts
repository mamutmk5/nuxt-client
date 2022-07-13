export type Envs = {
	ADMIN_TABLES_DISPLAY_CONSENT_COLUMN: boolean;
	ALERT_STATUS_URL?: string;
	ACCESSIBILITY_REPORT_EMAIL?: string;
	DOCUMENT_BASE_DIR: string;
	FALLBACK_DISABLED?: boolean;
	FEATURE_ADMIN_TOGGLE_STUDENT_LERNSTORE_VIEW_ENABLED?: boolean;
	TEACHER_STUDENT_VISIBILITY__IS_CONFIGURABLE?: boolean;
	FEATURE_ES_COLLECTIONS_ENABLED?: boolean;
	FEATURE_EXTENSIONS_ENABLED?: boolean;
	FEATURE_LERNSTORE_ENABLED?: boolean;
	FEATURE_TEAMS_ENABLED?: boolean;
	FEATURE_SCHOOL_POLICY_ENABLED?: boolean;
	FEATURE_VIDEOCONFERENCE_ENABLED?: boolean;
	FEATURE_LOGIN_LINK_ENABLED?: boolean;
	FEATURE_MATRIX_MESSENGER_ENABLED?: string;
	I18N__AVAILABLE_LANGUAGES: string;
	I18N__DEFAULT_LANGUAGE: string;
	I18N__DEFAULT_TIMEZONE: string;
	I18N__FALLBACK_LANGUAGE: string;
	JWT_SHOW_TIMEOUT_WARNING_SECONDS: number;
	JWT_TIMEOUT_SECONDS: number;
	MATRIX_MESSENGER__SCHOOL_SETTINGS_VISIBLE?: boolean;
	MATRIX_MESSENGER__STUDENT_ROOM_CREATION?: boolean;
	MATRIX_MESSENGER__SCHOOL_ROOM_ENABLED?: boolean;
	MATRIX_MESSENGER__DISCOVER_URI: string | undefined;
	MATRIX_MESSENGER__EMBED_URI: string | undefined;
	MATRIX_MESSENGER__URI: string | undefined;
	NOT_AUTHENTICATED_REDIRECT_URL: string;
	ROCKETCHAT_SERVICE_ENABLED?: boolean;
	SC_THEME: string;
	SC_TITLE: string;
	SC_SHORT_TITLE: string;
	FEATURE_USER_MIGRATION_ENABLED?: boolean;
	FEATURE_TASK_COPY_ENABLED?: boolean;
	FEATURE_COURSE_COPY?: boolean;
	FEATURE_COURSE_COPY_ENABLED?: boolean;
	FEATURE_LESSON_COPY_ENABLED?: boolean;
	GHOST_BASE_URL: string;
	FEATURE_COURSE_SHARE?: boolean;
};
