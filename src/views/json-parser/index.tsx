import { defineComponent, ref, unref } from 'vue'
import { Button, Input } from 'ant-design-vue'
import VueJsonPretty from 'vue-json-pretty'
import { BEM } from '@/utils/common'
import { deepParseJson, isJsonParseError, prepareForDisplay, PARSE_ERROR_DISPLAY_PREFIX } from './util'

import 'vue-json-pretty/lib/styles.css'
import './index.scss'

const ns = new BEM('json-parser')

export default defineComponent({
    name: 'JsonParser',
    setup() {
        const inputText = ref('')
        const displayData = ref<unknown>(null)
        const isTopLevelError = ref(false)
        const topLevelErrorMessage = ref('')
        const hasParsed = ref(false)

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

        function renderNodeValue({ node, defaultValue }: { node: { content: unknown }; defaultValue: unknown }) {
            const { content } = node
            if (typeof content === 'string' && content.startsWith(PARSE_ERROR_DISPLAY_PREFIX)) {
                return <span class={ns.e('error-value')}>{content}</span>
            }
            return defaultValue
        }

        return render

        function render() {
            const parsed = unref(hasParsed)
            const topError = unref(isTopLevelError)
            const data = unref(displayData)

            return (
                <div class={ns.b()}>
                    <div class={ns.e('input-area')}>
                        <Input.TextArea
                            value={unref(inputText)}
                            onChange={(e: Event) => { inputText.value = (e.target as HTMLTextAreaElement).value }}
                            placeholder="粘贴 JSON 字符串，支持多层嵌套 JSON..."
                            autoSize={{ minRows: 6, maxRows: 14 }}
                            class={ns.e('textarea')}
                        />
                        <div class={ns.e('actions')}>
                            <Button type="primary" onClick={handleParse} disabled={!unref(inputText).trim()}>解析</Button>
                            <Button onClick={handleClear}>清空</Button>
                        </div>
                    </div>

                    <div class={ns.e('result-area')}>
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
                    </div>
                </div>
            )
        }
    }
})
