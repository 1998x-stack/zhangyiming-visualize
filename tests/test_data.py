import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'data' / 'scripts'))
from validate_data import validate_corpus  # noqa: E402


VALID = '{"id":1,"section":"关于成长","section_num":1,"global_id":1,"content":"测试文本","tags":["成长"],"keywords":[]}'


class CorpusValidationTests(unittest.TestCase):
    def test_valid_corpus(self):
        self.assertEqual(validate_corpus(VALID), 1)

    def test_invalid_json_reports_line_number(self):
        with self.assertRaisesRegex(ValueError, 'line 2: invalid JSON'):
            validate_corpus(VALID + '\n{bad}')

    def test_duplicate_global_id_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'duplicate global_id'):
            validate_corpus(VALID + '\n' + VALID)

    def test_missing_tags_are_rejected(self):
        with self.assertRaisesRegex(ValueError, 'tags'):
            validate_corpus(VALID.replace('"tags":["成长"]', '"tags":null'))

    def test_boolean_id_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'id'):
            validate_corpus(VALID.replace('"id":1', '"id":true'))

    def test_empty_corpus_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'empty'):
            validate_corpus(' \n ')


if __name__ == '__main__':
    unittest.main()
