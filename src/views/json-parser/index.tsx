import { defineComponent, onMounted, ref, unref } from 'vue'
import { Button, Input } from 'ant-design-vue'
import { SwapOutlined } from '@ant-design/icons-vue'
import VueJsonPretty from 'vue-json-pretty'
import { BEM } from '@/utils/common'
import { deepParseJson, isJsonParseError, prepareForDisplay, PARSE_ERROR_DISPLAY_PREFIX } from './util'

import 'vue-json-pretty/lib/styles.css'
import './index.scss'

const ns = new BEM('json-parser')
const LEFT_MIN_WIDTH = 200
const LEFT_MAX_WIDTH = 760

export default defineComponent({
    name: 'JsonParser',
    setup() {
        const inputText = ref('')
        const displayData = ref<unknown>(null)
        const isTopLevelError = ref(false)
        const topLevelErrorMessage = ref('')
        const hasParsed = ref(false)
        const isHorizontal = ref(true)
        const leftWidthPx = ref(380)
        const containerRef = ref<HTMLElement | null>(null)

        onMounted(() => {
            const container = unref(containerRef)
            if (container) {
                leftWidthPx.value = Math.min(Math.floor(container.clientWidth * 0.3), LEFT_MAX_WIDTH)
            }
        })

        function handleParse() {
            const text = unref(inputText).trim()
            if (!text) return
            const result = deepParseJson(text)
            if (isJsonParseError(result)) {
                isTopLevelError.value = true
                topLevelErrorMessage.value = result.message
                displayData.value = null
            } else {
                isTopLevelError.value = false
                displayData.value = prepareForDisplay(result)
            }
            hasParsed.value = true
        }

        function handleClear() {
            inputText.value = ''
            displayData.value = null
            isTopLevelError.value = false
            topLevelErrorMessage.value = ''
            hasParsed.value = false
        }

        function toggleLayout() {
            isHorizontal.value = !unref(isHorizontal)
        }

        function onDividerMousedown(e: MouseEvent) {
            e.preventDefault()
            const startX = e.clientX
            const startWidth = unref(leftWidthPx)
            document.body.style.cursor = 'col-resize'
            document.body.style.userSelect = 'none'

            function onMousemove(ev: MouseEvent) {
                const newWidth = startWidth + (ev.clientX - startX)
                leftWidthPx.value = Math.max(LEFT_MIN_WIDTH, Math.min(newWidth, LEFT_MAX_WIDTH))
            }

            function onMouseup() {
                document.body.style.cursor = ''
                document.body.style.userSelect = ''
                document.removeEventListener('mousemove', onMousemove)
                document.removeEventListener('mouseup', onMouseup)
            }

            document.addEventListener('mousemove', onMousemove)
            document.addEventListener('mouseup', onMouseup)
        }

        function renderNodeValue({ node, defaultValue }: { node: { content: unknown }; defaultValue: unknown }) {
            const { content } = node
            if (typeof content === 'string' && content.startsWith(PARSE_ERROR_DISPLAY_PREFIX)) {
                return <span class={ns.e('error-value')}>{content}</span>
            }
            return defaultValue
        }

        function renderResultContent() {
            const parsed = unref(hasParsed)
            const topError = unref(isTopLevelError)
            const data = unref(displayData)
            return (
                <>
                    {!parsed && (
                        <div class={ns.e('empty')}>输入 JSON 字符串后点击"解析"查看结果</div>
                    )}
                    {parsed && topError && (
                        <div class={ns.e('top-error')}>
                            <span class={ns.e('top-error-label')}>顶层解析失败：</span>
                            <span class={ns.e('top-error-message')}>{unref(topLevelErrorMessage)}</span>
                        </div>
                    )}
                    {parsed && !topError && data !== null && (
                        <VueJsonPretty
                            data={data as any}
                            deep={3}
                            showLength={true}
                            renderNodeValue={renderNodeValue}
                        />
                    )}
                </>
            )
        }

        return render

        function render() {
            const horizontal = unref(isHorizontal)

            const toolbar = (
                <div class={ns.e('toolbar')}>
                    <Button icon={<SwapOutlined />} onClick={toggleLayout}>切换布局</Button>
                </div>
            )

            const actions = (
                <div class={ns.e('actions')}>
                    <Button onClick={handleClear}>清空</Button>
                    <Button type="primary" onClick={handleParse} disabled={!unref(inputText).trim()}>解析</Button>
                </div>
            )

            if (horizontal) {
                return (
                    <div class={[ns.b(), ns.m('horizontal')]} ref={containerRef}>
                        {toolbar}
                        <div class={ns.e('h-main')}>
                            <div class={ns.e('h-left')} style={{ width: `${unref(leftWidthPx)}px` }}>
                                <Input.TextArea
                                    value={unref(inputText)}
                                    onChange={(e: Event) => { inputText.value = (e.target as HTMLTextAreaElement).value }}
                                    placeholder="粘贴 JSON 字符串，支持多层嵌套 JSON..."
                                    class={[ns.e('textarea'), ns.em('textarea', 'fill')]}
                                />
                            </div>
                            <div class={ns.e('divider')} onMousedown={onDividerMousedown}>
                                <span class={ns.e('divider-dots')}>⋮</span>
                            </div>
                            <div class={ns.e('h-right')}>
                                {renderResultContent()}
                            </div>
                        </div>
                        <div class={ns.e('h-footer')}>
                            {actions}
                        </div>
                    </div>
                )
            }

            return (
                <div class={[ns.b(), ns.m('vertical')]} ref={containerRef}>
                    {toolbar}
                    <div class={ns.e('input-area')}>
                        <Input.TextArea
                            value={unref(inputText)}
                            onChange={(e: Event) => { inputText.value = (e.target as HTMLTextAreaElement).value }}
                            placeholder="粘贴 JSON 字符串，支持多层嵌套 JSON..."
                            autoSize={{ minRows: 6, maxRows: 14 }}
                            class={ns.e('textarea')}
                        />
                        {actions}
                    </div>
                    <div class={ns.e('result-area')}>
                        {renderResultContent()}
                    </div>
                </div>
            )
        }
    }
})
