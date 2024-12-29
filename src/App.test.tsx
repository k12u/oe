import { render, act, renderHook, fireEvent, screen } from '@testing-library/react'
import App from './App'
import { useFiles } from './useFiles'
import { StorageProvider } from './storage/StorageContext'
import { StorageInterface } from './storage/StorageInterface'

class MockStorage implements StorageInterface {
  private store: { [key: string]: any } = {};
  public mockGet = jest.fn();
  public mockSet = jest.fn();

  async get<T>(key: string): Promise<T | null> {
    this.mockGet(key);
    return this.store[key];
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.mockSet({ [key]: value });
    this.store[key] = value;
  }

  clear() {
    this.store = {};
    this.mockGet.mockClear();
    this.mockSet.mockClear();
  }

  setState(state: { [key: string]: any }) {
    this.store = state;
  }
}

const mockStorage = new MockStorage();

const renderWithStorage = (ui: React.ReactElement) => {
  return render(
    <StorageProvider storage={mockStorage}>
      {ui}
    </StorageProvider>
  );
};

describe('App', () => {
  beforeEach(() => {
    mockStorage.clear();
    mockStorage.setState({
      files: [],
      showArchived: false
    });
  });

  test('新規ファイル作成時にストレージが更新される', async () => {
    mockStorage.setState({
      files: []
    });

    await act(async () => {
      renderWithStorage(<App />);
    });

    const newFileButton = screen.getByRole('button', { name: /new note/i });
    
    await act(async () => {
      fireEvent.click(newFileButton);
    });

    const lastCall = mockStorage.mockSet.mock.calls[mockStorage.mockSet.mock.calls.length - 1][0];
    const filesArray = lastCall.files;
    
    expect(filesArray.length).toBe(1);
    
    expect(filesArray[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      content: '',
      archived: false
    });
  });

  test('ファイルのアーカイブ状態が正しく更新される', async () => {
    const testFile = {
      id: '1',
      name: 'Test Note',
      content: 'テスト',
      archived: false
    };
    
    mockStorage.setState({
      files: [testFile]
    });

    const { result } = renderHook(() => useFiles(), { 
      wrapper: ({ children }) => (
        <StorageProvider storage={mockStorage}>{children}</StorageProvider>
      )
    });
    
    await act(async () => {
      await result.current.toggleArchive('1');
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const lastCall = mockStorage.mockSet.mock.calls[mockStorage.mockSet.mock.calls.length - 1][0];
    expect(lastCall).toEqual({
      files: [{
        ...testFile,
        archived: true
      }]
    });
  });
}); 