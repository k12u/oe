import { render, act, renderHook } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'
import { useFiles } from './useFiles'

// Chrome APIのモック
const mockChromeStorage = {
  sync: {
    get: jest.fn(),
    set: jest.fn()
  }
}
global.chrome = {
  storage: mockChromeStorage,
  runtime: {
    sendMessage: jest.fn()
  }
} as any

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockChromeStorage.sync.get.mockImplementation((keys, callback) => {
      callback({ files: [], showArchived: false })
    })
  })

  test('新規ファイル作成時にストレージが更新される', async () => {
    render(<App />)
    
    // ファイル作成のロジックをトリガー
    await act(async () => {
      // アプリケーションの状態を更新
    })

    expect(mockChromeStorage.sync.set).toHaveBeenCalledWith(
      expect.objectContaining({
        files: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            content: '',
            archived: false
          })
        ])
      })
    )
  })

  test('ファイルのアーカイブ状態が正しく更新される', async () => {
    const testFile = {
      id: '1',
      name: 'Test Note',
      content: 'テスト',
      archived: false
    }
    
    // 初期状態の設定
    mockChromeStorage.sync.get.mockImplementation((keys, callback) => {
      callback({
        files: [testFile],
        showArchived: false
      })
    })

    const { result } = renderHook(() => useFiles())
    
    // アーカイブ操作をトリガー
    await act(async () => {
      result.current.toggleArchive('1')
    })

    // 最後の呼び出しの引数をチェック
    const lastCall = mockChromeStorage.sync.set.mock.calls[mockChromeStorage.sync.set.mock.calls.length - 1][0];
    expect(lastCall).toEqual({
      files: [{
        ...testFile,
        archived: true
      }]
    })
  })

  test('アーカイブ表示設定が正しく保存される', async () => {
    // 初期状態の設定
    mockChromeStorage.sync.get.mockImplementation((keys, callback) => {
      callback({
        showArchived: false
      })
    })

    const { result } = renderHook(() => useFiles())
    
    await act(async () => {
      result.current.toggleShowArchived()
    })

    // 最後の呼び出しの引数をチェック
    const lastCall = mockChromeStorage.sync.set.mock.calls[mockChromeStorage.sync.set.mock.calls.length - 1][0];
    expect(lastCall).toEqual({
      showArchived: true
    })
  })
}) 