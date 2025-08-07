import pygame
import random
import sys

pygame.init()

BOARD_WIDTH = 10
BOARD_HEIGHT = 20
BLOCK_SIZE = 30
WINDOW_WIDTH = BOARD_WIDTH * BLOCK_SIZE + 200
WINDOW_HEIGHT = BOARD_HEIGHT * BLOCK_SIZE + 100

BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
YELLOW = (255, 255, 0)
MAGENTA = (255, 0, 255)
CYAN = (0, 255, 255)
ORANGE = (255, 165, 0)
GRAY = (128, 128, 128)

COLORS = [
    BLACK,    # 0: empty
    RED,      # 1: I piece
    GREEN,    # 2: O piece
    BLUE,     # 3: T piece
    YELLOW,   # 4: S piece
    MAGENTA,  # 5: Z piece
    CYAN,     # 6: J piece
    ORANGE    # 7: L piece
]

PIECES = [
    [],  # 0: empty
    [    # 1: I piece
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [    # 2: O piece
        [2, 2],
        [2, 2]
    ],
    [    # 3: T piece
        [0, 3, 0],
        [3, 3, 3],
        [0, 0, 0]
    ],
    [    # 4: S piece
        [0, 4, 4],
        [4, 4, 0],
        [0, 0, 0]
    ],
    [    # 5: Z piece
        [5, 5, 0],
        [0, 5, 5],
        [0, 0, 0]
    ],
    [    # 6: J piece
        [6, 0, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    [    # 7: L piece
        [0, 0, 7],
        [7, 7, 7],
        [0, 0, 0]
    ]
]


class Tetris:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption('テトリス')
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 36)
        
        self.board = [[0] * BOARD_WIDTH for _ in range(BOARD_HEIGHT)]
        self.score = 0
        self.level = 1
        self.lines = 0
        self.drop_time = 0
        self.drop_interval = 1000
        
        self.current_piece = self.create_piece()
        self.next_piece = self.create_piece()
        
    def create_piece(self):
        piece_type = random.randint(1, 7)
        return {
            'type': piece_type,
            'shape': [row[:] for row in PIECES[piece_type]],
            'x': BOARD_WIDTH // 2 - len(PIECES[piece_type][0]) // 2,
            'y': 0
        }
    
    def is_valid_position(self, shape, x, y):
        for row in range(len(shape)):
            for col in range(len(shape[row])):
                if shape[row][col] != 0:
                    board_x = x + col
                    board_y = y + row
                    
                    if (board_x < 0 or board_x >= BOARD_WIDTH or 
                        board_y >= BOARD_HEIGHT or
                        (board_y >= 0 and self.board[board_y][board_x] != 0)):
                        return False
        return True
    
    def rotate_piece(self, shape):
        rows = len(shape)
        cols = len(shape[0])
        rotated = [[0] * rows for _ in range(cols)]
        
        for i in range(rows):
            for j in range(cols):
                rotated[j][rows - 1 - i] = shape[i][j]
        
        return rotated
    
    def move_piece(self, dx, dy):
        new_x = self.current_piece['x'] + dx
        new_y = self.current_piece['y'] + dy
        
        if self.is_valid_position(self.current_piece['shape'], new_x, new_y):
            self.current_piece['x'] = new_x
            self.current_piece['y'] = new_y
            return True
        elif dy > 0:
            self.place_piece()
            return False
        return False
    
    def rotate_current_piece(self):
        rotated = self.rotate_piece(self.current_piece['shape'])
        if self.is_valid_position(rotated, self.current_piece['x'], self.current_piece['y']):
            self.current_piece['shape'] = rotated
    
    def hard_drop(self):
        while self.move_piece(0, 1):
            pass
    
    def place_piece(self):
        for row in range(len(self.current_piece['shape'])):
            for col in range(len(self.current_piece['shape'][row])):
                if self.current_piece['shape'][row][col] != 0:
                    board_y = self.current_piece['y'] + row
                    board_x = self.current_piece['x'] + col
                    
                    if board_y >= 0:
                        self.board[board_y][board_x] = self.current_piece['type']
        
        self.clear_lines()
        self.current_piece = self.next_piece
        self.next_piece = self.create_piece()
        
        if not self.is_valid_position(self.current_piece['shape'], 
                                    self.current_piece['x'], 
                                    self.current_piece['y']):
            self.game_over()
    
    def clear_lines(self):
        lines_cleared = 0
        row = BOARD_HEIGHT - 1
        
        while row >= 0:
            if all(cell != 0 for cell in self.board[row]):
                del self.board[row]
                self.board.insert(0, [0] * BOARD_WIDTH)
                lines_cleared += 1
            else:
                row -= 1
        
        if lines_cleared > 0:
            self.lines += lines_cleared
            self.score += lines_cleared * 100 * self.level
            self.level = self.lines // 10 + 1
            self.drop_interval = max(50, 1000 - (self.level - 1) * 50)
    
    def game_over(self):
        print(f"ゲームオーバー！スコア: {self.score}")
        self.board = [[0] * BOARD_WIDTH for _ in range(BOARD_HEIGHT)]
        self.score = 0
        self.level = 1
        self.lines = 0
        self.drop_interval = 1000
        self.current_piece = self.create_piece()
        self.next_piece = self.create_piece()
    
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT:
                    self.move_piece(-1, 0)
                elif event.key == pygame.K_RIGHT:
                    self.move_piece(1, 0)
                elif event.key == pygame.K_DOWN:
                    self.move_piece(0, 1)
                elif event.key == pygame.K_UP:
                    self.rotate_current_piece()
                elif event.key == pygame.K_SPACE:
                    self.hard_drop()
        return True
    
    def update(self, dt):
        self.drop_time += dt
        
        if self.drop_time >= self.drop_interval:
            self.move_piece(0, 1)
            self.drop_time = 0
    
    def draw_board(self):
        for row in range(BOARD_HEIGHT):
            for col in range(BOARD_WIDTH):
                x = col * BLOCK_SIZE
                y = row * BLOCK_SIZE
                
                if self.board[row][col] != 0:
                    color = COLORS[self.board[row][col]]
                    pygame.draw.rect(self.screen, color, (x, y, BLOCK_SIZE, BLOCK_SIZE))
                
                pygame.draw.rect(self.screen, GRAY, (x, y, BLOCK_SIZE, BLOCK_SIZE), 1)
    
    def draw_current_piece(self):
        if not self.current_piece:
            return
        
        color = COLORS[self.current_piece['type']]
        
        for row in range(len(self.current_piece['shape'])):
            for col in range(len(self.current_piece['shape'][row])):
                if self.current_piece['shape'][row][col] != 0:
                    x = (self.current_piece['x'] + col) * BLOCK_SIZE
                    y = (self.current_piece['y'] + row) * BLOCK_SIZE
                    
                    pygame.draw.rect(self.screen, color, (x, y, BLOCK_SIZE, BLOCK_SIZE))
                    pygame.draw.rect(self.screen, GRAY, (x, y, BLOCK_SIZE, BLOCK_SIZE), 1)
    
    def draw_info(self):
        info_x = BOARD_WIDTH * BLOCK_SIZE + 10
        
        score_text = self.font.render(f"スコア: {self.score}", True, WHITE)
        self.screen.blit(score_text, (info_x, 50))
        
        level_text = self.font.render(f"レベル: {self.level}", True, WHITE)
        self.screen.blit(level_text, (info_x, 90))
        
        lines_text = self.font.render(f"ライン: {self.lines}", True, WHITE)
        self.screen.blit(lines_text, (info_x, 130))
        
        controls_text = [
            "操作方法:",
            "← →: 移動",
            "↓: 落下速度アップ",
            "↑: 回転",
            "スペース: ハードドロップ"
        ]
        
        for i, text in enumerate(controls_text):
            font_size = 24 if i == 0 else 18
            font = pygame.font.Font(None, font_size)
            control_text = font.render(text, True, WHITE)
            self.screen.blit(control_text, (info_x, 200 + i * 25))
    
    def draw(self):
        self.screen.fill(BLACK)
        self.draw_board()
        self.draw_current_piece()
        self.draw_info()
        pygame.display.flip()
    
    def run(self):
        running = True
        
        while running:
            dt = self.clock.tick(60)
            
            running = self.handle_events()
            self.update(dt)
            self.draw()
        
        pygame.quit()
        sys.exit()


if __name__ == "__main__":
    game = Tetris()
    game.run()