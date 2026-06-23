import json
from pathlib import Path
from graphify.build import build_from_json
from graphify.cluster import score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate

if __name__ == '__main__':
    extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding='utf-8'))
    detection  = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8'))
    analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding='utf-8'))

    G = build_from_json(extraction)
    communities = {int(k): v for k, v in analysis['communities'].items()}
    cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
    tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}

    # Generate labels based on community content
    labels = {}
    for cid, nodes in communities.items():
        # Analyze node names to infer community purpose
        node_names = ' '.join(nodes).lower()

        if 'ui_' in node_names and 'badge' in node_names:
            labels[cid] = 'UI Badge Components'
        elif 'ui_' in node_names and 'button' in node_names:
            labels[cid] = 'UI Button Components'
        elif 'ui_' in node_names and 'select' in node_names:
            labels[cid] = 'UI Select Components'
        elif 'ui_' in node_names and 'input' in node_names:
            labels[cid] = 'UI Input Components'
        elif 'ui_' in node_names and 'dialog' in node_names:
            labels[cid] = 'UI Dialog Components'
        elif 'ui_' in node_names and 'table' in node_names:
            labels[cid] = 'UI Table Components'
        elif 'ui_' in node_names and 'dropdown' in node_names:
            labels[cid] = 'UI Dropdown Menu'
        elif 'ui_' in node_names and 'tabs' in node_names:
            labels[cid] = 'UI Tabs Components'
        elif 'ui_' in node_names and 'avatar' in node_names:
            labels[cid] = 'UI Avatar Components'
        elif 'instructor' in node_names and 'chat' in node_names:
            labels[cid] = 'Instructor Chat System'
        elif 'instructor' in node_names and 'evaluation' in node_names:
            labels[cid] = 'Evaluation Management'
        elif 'instructor' in node_names and 'student' in node_names:
            labels[cid] = 'Student Management'
        elif 'admin' in node_names and 'user' in node_names:
            labels[cid] = 'Admin User Management'
        elif 'admin' in node_names:
            labels[cid] = 'Admin Dashboard'
        elif 'auth' in node_names and 'token' in node_names:
            labels[cid] = 'Authentication & Tokens'
        elif 'auth' in node_names:
            labels[cid] = 'Authentication'
        elif 'mail' in node_names:
            labels[cid] = 'Email Services'
        elif 'mongodb' in node_names or 'usermodel' in node_names:
            labels[cid] = 'Database & Models'
        elif 'schema' in node_names:
            labels[cid] = 'Schema Validation'
        elif 'theme' in node_names:
            labels[cid] = 'Theme System'
        elif 'provider' in node_names:
            labels[cid] = 'Context Providers'
        elif 'hook' in node_names or 'use' in node_names:
            labels[cid] = 'Custom Hooks'
        elif 'config' in node_names or 'eslint' in node_names or 'postcss' in node_names:
            labels[cid] = 'Configuration'
        elif 'mock' in node_names:
            labels[cid] = 'Mock Data'
        elif 'util' in node_names:
            labels[cid] = 'Utilities'
        elif 'api' in node_names:
            labels[cid] = 'API Routes'
        elif 'page' in node_names:
            labels[cid] = 'Page Components'
        elif 'component' in node_names:
            labels[cid] = 'Custom Components'
        else:
            labels[cid] = f'Community {cid}'

    # Regenerate questions with real community labels
    questions = suggest_questions(G, communities, labels)

    report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'], detection, tokens, '.', suggested_questions=questions)
    Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
    Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False), encoding='utf-8')
    print('Report updated with community labels')
